/**
 * 云南旅游279分销内测账户创建脚本
 * 数据来源：CSV 表格_20260417 (1).csv
 * 
 * CSV字段定义：
 * - 自购单：用户自己购买的订单数
 * - 直推单：推荐人字段指向该用户的总订单数
 * - 团队总单量：自购单 + 直推单
 * - 成团数：floor(团队总单量 / 7)
 * 
 * 预期结果验证（279规则）：
 * 1. A的佣金 = 第1单30%×239.7 + 第2-9单循环×(559.3×4 + 239.7×4) + 成团1×800 + 间推10%×sum(下级直推单×799×10%)
 * 2. 排行榜顺序：按累计佣金收益排序
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Commission = require('./models/Commission');
const Product = require('./models/Product');
const DistributionService = require('./services/DistributionService');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yntour', { serverSelectionTimeoutMS: 5000 });
  console.log('=== 云南旅游279内测账户创建 ===\n');

  // 清理旧测试数据
  await User.deleteMany({ nickname: { $regex: /^内测用户/ } });
  await Order.deleteMany({ orderNo: { $regex: /^NKTEST/ } });
  await Commission.deleteMany({ description: { $regex: /^内测/ } });
  console.log('已清理旧测试数据\n');

  // CSV数据
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

  // 创建测试用户（用于充当下级购买者）
  const customerUsers = [];
  for (let i = 0; i < 50; i++) {
    let u = await User.findOne({ nickname: '内测顾客' + i });
    if (!u) {
      u = await User.create({
        openid: 'test_customer_' + i + '_' + Date.now(),
        nickname: '内测顾客' + i,
        isDistributor: false,
        selfOrderNum: 0,
        directPushNum: 0
      });
    }
    customerUsers.push(u);
  }
  console.log('创建了', customerUsers.length, '个顾客账户\n');

  // 获取/创建产品
  let product = await Product.findOne();
  if (!product) {
    product = await Product.create({ name: '云南6天5晚旅游套餐', price: 799 });
  }
  console.log('产品ID:', product._id, '价格:¥' + product.price, '\n');

  // 创建10个测试用户
  const userMap = {};
  for (const u of csvData) {
    const user = await User.create({
      openid: 'nk_test_' + u.name + '_' + Date.now(),
      nickname: '内测用户' + u.name,
      phone: '139000' + (csvData.indexOf(u) + 1).toString().padStart(2, '0'),
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
      isValid: true
    });
    userMap[u.name] = user;
    console.log(`[${u.name}] 创建完成`);
  }

  // 建立推荐关系
  for (const u of csvData) {
    if (u.referrer && userMap[u.referrer]) {
      userMap[u.name].parentId = userMap[u.referrer]._id;
      await userMap[u.name].save();
    }
  }
  console.log('');

  // 创建订单的计数器
  const orderCounters = {};
  csvData.forEach(u => orderCounters[u.name] = 0);

  // 为每个测试用户创建"自购订单"（1单/人）
  console.log('--- 创建自购订单 ---');
  for (const u of csvData) {
    const order = await Order.create({
      orderNo: 'NKTEST_' + u.name + '_S1',
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
    orderCounters[u.name]++;
    console.log(`[${u.name}] 自购订单 NKTEST_${u.name}_S1`);
  }
  console.log('');

  // 为每个测试用户创建"直推订单"（以测试用户为推荐人）
  // 这些订单由随机顾客账户购买
  console.log('--- 创建直推订单 ---');
  let customerIdx = 0;
  const createdOrders = [];

  for (const u of csvData) {
    const referrer = userMap[u.name];
    const referrerName = u.name;

    for (let i = 0; i < u.directPush; i++) {
      // 循环使用顾客账户
      const customer = customerUsers[customerIdx % customerUsers.length];
      customerIdx++;

      // 该顾客的唯一上级（通过parentId链追溯）
      // 为了让推荐关系正确：设置顾客的parentId为referrer
      customer.parentId = referrer._id;
      await customer.save();

      const orderIndex = orderCounters[u.name] + 1;
      orderCounters[u.name]++;

      const order = await Order.create({
        orderNo: 'NKTEST_' + referrerName + '_D' + orderIndex,
        userId: customer._id,
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
          referrerOrderIndex: orderIndex
        },
        commissionStatus: 'frozen',
        isValid: true
      });
      createdOrders.push({ order, referrerName, orderIndex });
    }
    console.log(`[${u.name}] 创建了 ${u.directPush} 条直推订单（推荐人=${referrerName}）`);
  }
  console.log('');

  // 更新每个测试用户的统计字段（与CSV一致）
  console.log('--- 更新用户统计字段 ---');
  for (const u of csvData) {
    await User.findByIdAndUpdate(userMap[u.name]._id, {
      selfOrderNum: u.selfOrder,
      directPushNum: u.directPush,
      lockedUserOrderNum: 0,
      groupNum: u.groups,
      totalTeamOrder: u.teamTotal
    });
    console.log(`[${u.name}] selfOrderNum=${u.selfOrder} directPushNum=${u.directPush} groupNum=${u.groups}`);
  }
  console.log('');

  // 运行佣金计算（对每个直推定单）
  console.log('--- 运行佣金计算 ---');
  for (const { order } of createdOrders) {
    try {
      const result = await DistributionService.calculateCommission(order._id);
      if (result.success) {
        console.log(`[${order.orderNo}] 佣金计算成功`);
      } else {
        console.log(`[${order.orderNo}] 佣金计算失败: ${result.message}`);
      }
    } catch (e) {
      console.log(`[${order.orderNo}] 错误: ${e.message}`);
    }
  }
  console.log('');

  // 查询佣金记录
  console.log('--- 佣金记录汇总 ---');
  for (const u of csvData) {
    const commissions = await Commission.find({ 
      userId: userMap[u.name]._id,
      description: { $regex: /^内测/ }
    }).sort({ createdAt: 1 });

    const user = await User.findById(userMap[u.name]._id);
    const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);

    console.log(`[${u.name}] 总佣金: ¥${totalCommission.toFixed(2)} | availableBalance: ¥${user.availableBalance} | frozenBalance: ¥${user.frozenBalance}`);
    commissions.forEach(c => {
      console.log(`  -> ${c.type} ¥${c.amount} status=${c.status} ${c.description || ''}`);
    });
  }
  console.log('');

  // 查询排行榜
  console.log('--- 排行榜 ---');
  const rankings = await User.find({ nickname: { $regex: /^内测用户/ } })
    .sort({ totalEarnings: -1 })
    .select('nickname totalEarnings availableBalance frozenBalance');

  rankings.forEach((u, i) => {
    console.log(`#${i+1} ${u.nickname} 总收益¥${u.totalEarnings} 可用¥${u.availableBalance} 冻结¥${u.frozenBalance}`);
  });

  await mongoose.disconnect();
  console.log('\n=== 完成 ===');
  process.exit(0);
}

main().catch(err => {
  console.error('错误:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
