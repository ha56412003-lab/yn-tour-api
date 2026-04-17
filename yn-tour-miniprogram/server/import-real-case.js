/**
 * 云南旅游 - 真实案例数据导入
 * 将CSV的10个测试案例导入为"真实用户+真实订单"
 * 
 * 名字规则：中间字或尾字用*替代
 * 头像：使用 ui-avatars.com 生成带姓名的头像
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Commission = require('./models/Commission');
const Product = require('./models/Product');
const DistributionService = require('./services/DistributionService');

// 用户名（虚拟，*替代部分字符保护隐私）
const userNames = {
  A: '张*峰',      // A是顶级用户
  B: '李*明',
  C: '王*霞',
  D: '刘*华',
  E: '陈*强',
  F: '杨*林',
  G: '赵*梅',
  H: '黄*丽',
  I: '周*明',
  J: '吴*川'
};

// 微信头像URL生成（使用ui-avatars.com，根据姓名生成彩色头像）
function getAvatarUrl(name) {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=4facfe&color=fff&size=128&font-size=0.4&bold=true`;
}

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yntour', { serverSelectionTimeoutMS: 5000 });
  console.log('=== 云南旅游 - 真实案例导入 ===\n');

  // 清理之前的测试数据
  await User.deleteMany({ nickname: { $in: Object.values(userNames) } });
  await Order.deleteMany({ orderNo: { $regex: /^CASE_2026/ } });
  await Commission.deleteMany({ description: { $regex: /^案例/ } });
  console.log('已清理旧数据\n');

  // CSV原始数据
  const csvData = [
    { name: 'A', referrer: null,  selfOrder: 1, directPush: 9,  teamTotal: 10, groups: 1 },
    { name: 'B', referrer: 'A',  selfOrder: 1, directPush: 7,  teamTotal: 8,  groups: 1 },
    { name: 'C', referrer: 'A',  selfOrder: 1, directPush: 5,  teamTotal: 6,  groups: 0 },
    { name: 'D', referrer: 'A',  selfOrder: 1, directPush: 4,  teamTotal: 5,  groups: 0 },
    { name: 'E', referrer: 'B',  selfOrder: 1, directPush: 3,  teamTotal: 4,  groups: 0 },
    { name: 'F', referrer: 'B',  selfOrder: 1, directPush: 6,  teamTotal: 7,  groups: 1 },
    { name: 'G', referrer: 'C',  selfOrder: 1, directPush: 2,  teamTotal: 3,  groups: 0 },
    { name: 'H', referrer: 'D',  selfOrder: 1, directPush: 1,  teamTotal: 2,  groups: 0 },
    { name: 'I', referrer: 'E',  selfOrder: 1, directPush: 8,  teamTotal: 9,  groups: 1 },
    { name: 'J', referrer: 'F',  selfOrder: 1, directPush: 0,  teamTotal: 1,  groups: 0 }
  ];

  // 获取或创建产品
  let product = await Product.findOne();
  if (!product) {
    product = await Product.create({
      name: '云南6天5晚旅游套餐',
      price: 799,
      description: '云南6天5晚精品游'
    });
    console.log('创建产品:', product.name, '¥' + product.price);
  } else {
    console.log('使用已有产品:', product.name, '¥' + product.price);
  }

  // 1. 创建10个主用户
  console.log('\n--- 创建用户 ---');
  const userMap = {};
  for (const u of csvData) {
    const nickname = userNames[u.name];
    const avatar = getAvatarUrl(nickname);
    
    const user = await User.create({
      openid: 'case_wx_' + u.name + '_20260417',
      nickname: nickname,
      avatar: avatar,
      phone: '139' + Date.now().toString().slice(-8) + csvData.indexOf(u).toString(),
      isDistributor: true,
      parentId: null,
      selfOrderNum: 0,
      directPushNum: 0,
      lockedUserOrderNum: 0,
      totalEarnings: 0,
      availableBalance: 0,
      frozenBalance: 0,
      totalTeamOrder: 0,
      groupNum: 0,
      isValid: true,
      // 附加信息（用于展示）
      realName: nickname.replace('*', '某'),  // 虚拟真实姓名
      wechatId: 'wx_case_' + u.name.toLowerCase() + '2026'
    });
    
    userMap[u.name] = user;
    console.log(`[${u.name}] ${nickname} | 头像: ${avatar}`);
  }

  // 2. 建立推荐关系
  console.log('\n--- 建立推荐关系 ---');
  for (const u of csvData) {
    if (u.referrer && userMap[u.referrer]) {
      userMap[u.name].parentId = userMap[u.referrer]._id;
      userMap[u.name].parentName = userNames[u.referrer];
      await userMap[u.name].save();
      console.log(`[${u.name}] ${userNames[u.name]} 的推荐人: ${userNames[u.referrer]}`);
    } else {
      console.log(`[${u.name}] ${userNames[u.name]} 是顶级用户`);
    }
  }

  // 3. 创建随机顾客账户（用于充当下级购买者）
  console.log('\n--- 创建顾客账户 ---');
  const customerNames = ['张先生', '李女士', '王先生', '刘女士', '陈先生', '赵女士', '孙先生', '周女士', '钱先生', '吴女士', '郑先生', '王女士', '冯先生', '陈女士', '褚先生', '卫女士', '蒋先生', '沈女士', '韩先生', '杨女士'];
  const customers = [];
  for (let i = 0; i < 50; i++) {
    const cname = customerNames[i % customerNames.length];
    let u = await User.findOne({ nickname: cname, isDistributor: false });
    if (!u) {
      u = await User.create({
        openid: 'case_customer_' + i + '_' + Date.now(),
        nickname: cname,
        avatar: getAvatarUrl(cname),
        isDistributor: false,
        parentId: null,
        selfOrderNum: 0,
        directPushNum: 0
      });
    }
    customers.push(u);
  }
  console.log(`创建/找到 ${customers.length} 个顾客账户`);

  // 4. 创建订单
  console.log('\n--- 创建订单 ---');
  const orderCounter = {};
  csvData.forEach(u => orderCounter[u.name] = 0);
  const createdOrders = [];

  // 4.1 自购订单（每人1单）
  console.log('\n[自购订单]');
  for (const u of csvData) {
    const order = await Order.create({
      orderNo: `CASE_2026_${u.name}_S1`,
      userId: userMap[u.name]._id,
      productId: product._id,
      productName: product.name,
      productPrice: 799,
      quantity: 1,
      totalAmount: 799,
      status: 'paid',
      paidAt: new Date('2026-04-10T10:00:00'),
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
    orderCounter[u.name]++;
    createdOrders.push({ order, userName: u.name, type: 'self' });
    console.log(`[${u.name}] ${userNames[u.name]} 自购 ¥799 订单号:${order.orderNo}`);
  }

  // 4.2 直推订单（以测试用户为推荐人）
  // 这些订单由顾客账户购买，测试用户获得佣金
  console.log('\n[直推订单]');
  let customerIdx = 0;
  
  for (const u of csvData) {
    if (u.directPush === 0) continue;
    
    const referrer = userMap[u.name];
    const referrerName = u.name;
    
    for (let i = 0; i < u.directPush; i++) {
      // 轮流使用顾客账户
      const customer = customers[customerIdx % customers.length];
      customerIdx++;
      
      // 设置顾客的推荐人
      customer.parentId = referrer._id;
      await customer.save();
      
      const orderIdx = orderCounter[u.name] + 1;
      orderCounter[u.name]++;
      
      // 订单时间稍微错开（模拟真实订单）
      const orderDate = new Date('2026-04-10T12:00:00');
      orderDate.setMinutes(orderDate.getMinutes() + orderIdx * 5);
      
      const order = await Order.create({
        orderNo: `CASE_2026_${referrerName}_D${orderIdx}`,
        userId: customer._id,
        productId: product._id,
        productName: product.name,
        productPrice: 799,
        quantity: 1,
        totalAmount: 799,
        status: 'paid',
        paidAt: orderDate,
        deliveryStatus: 'paid',
        distribution: {
          isSelfOrder: false,
          referrerId: referrer._id,
          isLockedOrder: false,
          directProfit: 0,
          groupBonus: 0,
          referrerOrderIndex: orderIdx
        },
        commissionStatus: 'frozen',
        isValid: true
      });
      
      createdOrders.push({ order, userName: referrerName, type: 'direct', customer: customer.nickname });
    }
    console.log(`[${u.name}] ${userNames[u.name]} 产生 ${u.directPush} 条直推订单`);
  }

  // 5. 更新用户统计字段（与CSV一致）
  console.log('\n--- 更新用户统计 ---');
  for (const u of csvData) {
    await User.findByIdAndUpdate(userMap[u.name]._id, {
      selfOrderNum: u.selfOrder,
      directPushNum: u.directPush,
      lockedUserOrderNum: 0,
      groupNum: u.groups,
      totalTeamOrder: u.teamTotal
    });
    console.log(`[${u.name}] ${userNames[u.name]}: 自购${u.selfOrder} 直推${u.directPush} 团队${u.teamTotal} 团${u.groups}`);
  }

  // 6. 运行佣金计算
  console.log('\n--- 佣金计算 ---');
  let successCount = 0;
  let failCount = 0;
  
  for (const { order, userName, type } of createdOrders) {
    if (type === 'self') continue; // 自购订单不计算佣金
    
    try {
      const result = await DistributionService.calculateCommission(order._id);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        console.log(`  [${order.orderNo}] 失败: ${result.message}`);
      }
    } catch (e) {
      failCount++;
      console.log(`  [${order.orderNo}] 错误: ${e.message}`);
    }
  }
  console.log(`佣金计算完成: 成功${successCount} 失败${failCount}`);

  // 7. 计算并展示结果
  console.log('\n========== 导入结果 ==========\n');

  // 用户汇总
  console.log('【用户列表】');
  for (const u of csvData) {
    const user = await User.findById(userMap[u.name]._id);
    console.log(`${u.name}. ${userNames[u.name]} | 累计收益¥${user.totalEarnings} | 可用¥${user.availableBalance} | 冻结¥${user.frozenBalance}`);
  }

  // 排行榜
  console.log('\n【佣金排行榜】');
  const rankings = await User.find({ nickname: { $in: Object.values(userNames) } })
    .sort({ totalEarnings: -1 })
    .select('nickname totalEarnings availableBalance frozenBalance groupNum');
  
  rankings.forEach((u, i) => {
    const csvUser = csvData.find(d => userNames[d.name] === u.nickname);
    console.log(`#${i+1} ${u.nickname} | 总收益¥${u.totalEarnings.toFixed(2)} | 可用¥${u.availableBalance.toFixed(2)} | 冻结¥${u.frozenBalance.toFixed(2)} | 团数:${u.groupNum}`);
  });

  // 订单汇总
  const allOrders = await Order.find({ orderNo: { $regex: /^CASE_2026/ } });
  const paidOrders = allOrders.filter(o => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  console.log('\n【订单统计】');
  console.log(`总订单数: ${allOrders.length}`);
  console.log(`已付款: ${paidOrders.length}`);
  console.log(`总收入: ¥${totalRevenue}`);
  
  // 佣金汇总
  const allCommissions = await Commission.find({ description: { $regex: /^案例/ } });
  const totalCommission = allCommissions.reduce((sum, c) => sum + c.amount, 0);
  
  console.log('\n【佣金统计】');
  console.log(`佣金记录数: ${allCommissions.length}`);
  console.log(`佣金总额: ¥${totalCommission.toFixed(2)}`);

  console.log('\n========== 导入完成 ==========');
  console.log('\n这些用户现在可以在小程序中查看：');
  console.log('- 排行榜（团队排行榜 Tab）');
  console.log('- 佣金明细（我的佣金）');
  console.log('- 订单记录（我的订单）');
  
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('错误:', err.message);
  console.error(err.stack);
  mongoose.disconnect();
  process.exit(1);
});
