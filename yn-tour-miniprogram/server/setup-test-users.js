const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Commission = require('./models/Commission');
const Product = require('./models/Product');
const DistributionService = require('./services/DistributionService');

async function setup() {
  // 连接数据库
  await mongoose.connect('mongodb://localhost:27017/yntour', { serverSelectionTimeoutMS: 5000 });
  console.log('数据库连接成功');

  const testUsers = [
    { name: 'A', referrer: null,        selfOrder: 1, directPush: 9,  teamTotal: 10, groups: 1 },
    { name: 'B', referrer: 'A',         selfOrder: 1, directPush: 7,  teamTotal: 8,  groups: 1 },
    { name: 'C', referrer: 'A',         selfOrder: 1, directPush: 5,  teamTotal: 6,  groups: 0 },
    { name: 'D', referrer: 'A',         selfOrder: 1, directPush: 4,  teamTotal: 5,  groups: 0 },
    { name: 'E', referrer: 'B',         selfOrder: 1, directPush: 3,  teamTotal: 4,  groups: 0 },
    { name: 'F', referrer: 'B',         selfOrder: 1, directPush: 6,  teamTotal: 7,  groups: 1 },
    { name: 'G', referrer: 'C',         selfOrder: 1, directPush: 2,  teamTotal: 3,  groups: 0 },
    { name: 'H', referrer: 'D',         selfOrder: 1, directPush: 1,  teamTotal: 2,  groups: 0 },
    { name: 'I', referrer: 'E',         selfOrder: 1, directPush: 8,  teamTotal: 9,  groups: 1 },
    { name: 'J', referrer: 'F',         selfOrder: 1, directPush: 0,  teamTotal: 1,  groups: 0 }
  ];

  // 清理旧数据
  await User.deleteMany({ nickname: { $regex: /^测试用户/ } });
  await Order.deleteMany({ orderNo: { $regex: /^TEST/ } });
  await Commission.deleteMany({ description: { $regex: /^测试/ } });
  console.log('旧测试数据已清理');

  // 1. 创建所有用户
  const userMap = {};
  for (const u of testUsers) {
    const user = await User.create({
      openid: 'test_openid_' + u.name + '_' + Date.now(),
      nickname: '测试用户' + u.name,
      phone: '1380000' + (testUsers.indexOf(u) + 1).toString().padStart(2, '0'),
      isDistributor: true,
      parentId: null,
      selfOrderNum: 0,
      directPushNum: 0,
      lockedUserOrderNum: 0,
      totalEarnings: 0,
      availableBalance: 0,
      frozenBalance: 0,
      totalTeamOrder: u.teamTotal,
      groupNum: u.groups,
      isValid: true
    });
    userMap[u.name] = user;
    console.log(`创建用户 ${u.name} (${user._id})`);
  }

  // 2. 更新parentId关系
  for (const u of testUsers) {
    if (u.referrer && userMap[u.referrer]) {
      userMap[u.name].parentId = userMap[u.referrer]._id;
      await userMap[u.name].save();
      console.log(`${u.name} 推荐人 -> ${u.referrer}`);
    }
  }

  // 3. 获取/创建产品
  let product = await Product.findOne();
  if (!product) {
    product = await Product.create({ name: '云南6天5晚旅游套餐', price: 799 });
  }
  console.log(`产品: ${product._id}`);

  // 4. 创建自购订单（每人1单）
  for (const u of testUsers) {
    for (let i = 0; i < u.selfOrder; i++) {
      const order = await Order.create({
        orderNo: 'TEST_' + u.name + '_S' + (i + 1),
        userId: userMap[u.name]._id,
        productId: product._id,
        productName: product.name,
        productPrice: 799,
        quantity: 1,
        totalAmount: 799,
        status: 'paid',
        paidAt: new Date('2026-04-10'),
        deliveryStatus: 'paid',
        distribution: {
          isSelfOrder: true,
          referrerId: null,
          isLockedOrder: false,
          directProfit: 0,
          groupBonus: 0,
          referrerOrderIndex: 0
        },
        commissionStatus: 'frozen',
        isValid: true
      });
      console.log(`订单 ${order.orderNo} 付款成功`);
    }
  }

  console.log('\n=== 订单创建完成 ===\n');

  // 5. 计算每个用户的佣金
  for (const u of testUsers) {
    // 更新用户统计字段
    await User.findByIdAndUpdate(userMap[u.name]._id, {
      selfOrderNum: u.selfOrder,
      directPushNum: u.directPush,
      lockedUserOrderNum: 0,
      groupNum: u.groups,
      totalTeamOrder: u.teamTotal
    });
    console.log(`更新 ${u.name}: selfOrderNum=${u.selfOrder}, directPushNum=${u.directPush}, groupNum=${u.groups}`);

    // 创建directPush条直推订单（来自下级的购买）
    const parentName = u.referrer;
    if (parentName) {
      const referrer = userMap[parentName];
      for (let i = 0; i < u.directPush; i++) {
        const buyer = userMap[testUsers[Math.floor(Math.random() * testUsers.length)].name];
        // 跳过自己
        const actualBuyer = testUsers[Math.floor(Math.random() * (testUsers.length - 1))];
        const orderBuyer = userMap[testUsers[(testUsers.indexOf(u) + 1 + Math.floor(Math.random() * (testUsers.length - 1))) % testUsers.length].name];
        
        const childIndex = i + 1;
        const order = await Order.create({
          orderNo: 'TEST_' + u.name + '_D' + childIndex,
          userId: orderBuyer._id,
          productId: product._id,
          productName: product.name,
          productPrice: 799,
          quantity: 1,
          totalAmount: 799,
          status: 'paid',
          paidAt: new Date('2026-04-10'),
          deliveryStatus: 'paid',
          distribution: {
            isSelfOrder: false,
            referrerId: referrer._id,
            isLockedOrder: false,
            directProfit: 0,
            groupBonus: 0,
            referrerOrderIndex: childIndex
          },
          commissionStatus: 'frozen',
          isValid: true
        });
        
        // 更新buyer的parentId
        if (!orderBuyer.parentId) {
          orderBuyer.parentId = referrer._id;
          await orderBuyer.save();
        }
        
        console.log(`  -> ${orderBuyer.nickname} 购买订单 ${order.orderNo}，推荐人 ${parentName}（第${childIndex}单）`);
      }
    }
  }

  console.log('\n=== 佣金计算 ===\n');

  // 6. 重新查询所有用户
  const allUsers = await User.find({ nickname: { $regex: /^测试用户/ } });
  for (const u of allUsers) {
    u.selfOrderNum = 0;
    u.directPushNum = 0;
    u.lockedUserOrderNum = 0;
    u.groupNum = 0;
  }

  // 重新计算 directPushNum
  for (const u of testUsers) {
    const myOrders = await Order.find({ userId: userMap[u.name]._id, 'distribution.isSelfOrder': false });
    console.log(`${u.name} 有 ${myOrders.length} 条直推订单`);
  }

  console.log('\n测试账户创建完成，请检查数据');

  await mongoose.disconnect();
  process.exit(0);
}

setup().catch(err => {
  console.error('错误:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
