/**
 * 云南旅游 - 真实案例数据导入 V3
 * 
 * 修复V2的bug：每次都从数据库重新查询customer，避免缓存的parentId问题
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
  A: '张*峰', B: '李*明', C: '王*霞', D: '刘*华',
  E: '陈*强', F: '杨*林', G: '赵*梅', H: '黄*丽',
  I: '周*明', J: '吴*川'
};

// 微信头像URL生成
function getAvatarUrl(name) {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=4facfe&color=fff&size=128&font-size=0.4&bold=true`;
}

// 创建顾客池名称
function createCustomerNames(size) {
  const pool = [];
  const firstNames = ['张', '李', '王', '刘', '陈', '赵', '孙', '周', '钱', '吴', '郑', '冯', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦'];
  const lastNames = ['先生', '女士', '太太', '经理', '小姐', '老板', '女士', '先生', '女士', '小姐'];
  
  for (let i = 0; i < size; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    // 交替用*隐藏中间或末尾
    if (i % 3 === 0) {
      pool.push(firstName + '**' + lastName);
    } else if (i % 3 === 1) {
      pool.push(firstName + '*' + lastName);
    } else {
      pool.push(firstName + lastName[0] + '*');
    }
  }
  return pool;
}

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yn-tour', { serverSelectionTimeoutMS: 5000 });
  console.log('=== 云南旅游 - 真实案例导入 V3 ===\n');

  // 清理旧数据
  const caseNames = Object.values(userNames);
  await User.deleteMany({ nickname: { $in: caseNames } });
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
    product = await Product.create({ name: '云南6天5晚旅游套餐', price: 799 });
  }
  console.log('产品:', product.name, '¥' + product.price);

  // 1. 创建主用户
  console.log('\n--- 创建用户 ---');
  const userMap = {};
  for (const u of csvData) {
    const nickname = userNames[u.name];
    const user = await User.create({
      openid: 'case_v3_' + u.name + '_' + Date.now(),
      nickname: nickname,
      avatar: getAvatarUrl(nickname),
      phone: '139' + (10000000 + csvData.indexOf(u)).toString(),
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
    console.log(`[${u.name}] ${nickname} (${user._id.toString().slice(-6)})`);
  }

  // 2. 建立推荐关系
  console.log('\n--- 推荐关系 ---');
  for (const u of csvData) {
    if (u.referrer && userMap[u.referrer]) {
      userMap[u.name].parentId = userMap[u.referrer]._id;
      await userMap[u.name].save();
    }
    const parentName = u.referrer ? userNames[u.referrer] : '（顶级）';
    console.log(`[${u.name}] ${userNames[u.name]} <- ${parentName}`);
  }

  // 3. 创建顾客池（用不同名字确保全新用户）
  const customerNames = createCustomerNames(100);
  const customerIds = [];
  
  console.log('\n--- 创建顾客账户 ---');
  for (const cname of customerNames) {
    let u = await User.findOne({ nickname: cname, isDistributor: false });
    if (!u) {
      u = await User.create({
        openid: 'case_cust_' + cname + '_' + Date.now(),
        nickname: cname,
        avatar: getAvatarUrl(cname),
        isDistributor: false,
        parentId: null
      });
    }
    customerIds.push(u._id);
  }
  console.log(`顾客池: ${customerIds.length}个`);

  // 4. 创建订单
  console.log('\n--- 创建订单 ---');
  const createdOrders = [];
  let customerIdx = 0;
  
  for (const u of csvData) {
    const referrer = userMap[u.name];
    const referrerName = u.name;
    
    // 4.1 自购订单
    const selfOrder = await Order.create({
      orderNo: `CASE_2026_${referrerName}_S1`,
      userId: referrer._id,
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
    createdOrders.push({ order: selfOrder, userName: referrerName, type: 'self' });
    console.log(`[${referrerName}] ${userNames[referrerName]} 自购订单`);
    
    // 4.2 直推订单（每个顾客只用一次）
    for (let i = 0; i < u.directPush; i++) {
      // 每次从DB重新查询，避免Mongoose缓存问题
      const customer = await User.findById(customerIds[customerIdx]);
      customerIdx++;
      
      // 设置parentId
      customer.parentId = referrer._id;
      await customer.save();
      
      const orderIdx = i + 1;
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
    console.log(`[${referrerName}] 直推 ${u.directPush} 单 (Referrer ID: ${referrer._id.toString().slice(-6)})`);
  }

  // 5. 更新用户统计字段（与CSV一致）
  console.log('\n--- 更新统计 ---');
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
    if (type === 'self') continue;
    
    try {
      const result = await DistributionService.calculateCommission(order._id);
      if (result.success) successCount++;
      else failCount++;
    } catch (e) {
      failCount++;
      console.log(`  [${order.orderNo}] 错误`);
    }
  }
  console.log(`完成: 成功${successCount} 失败${failCount}`);

  // 7. 验证结果
  console.log('\n========== 验证结果 ==========\n');

  // 检查订单的referrerId是否正确
  console.log('【订单referrerId验证】');
  for (const u of csvData) {
    const aOrders = await Order.find({ orderNo: `CASE_2026_${u.name}_D1` });
    if (aOrders.length > 0) {
      const o = aOrders[0];
      const expected = userMap[u.name]._id.toString().slice(-6);
      const actual = o.distribution.referrerId ? o.distribution.referrerId.toString().slice(-6) : 'null';
      const ok = actual === expected ? '✅' : '❌';
      console.log(`  ${ok} ${u.name}_D1 referrer: ${actual} (expected: ${expected})`);
    }
  }

  // 佣金汇总
  console.log('\n【用户收益】');
  const results = [];
  for (const u of csvData) {
    const user = await User.findById(userMap[u.name]._id);
    results.push({
      name: u.name,
      nickname: userNames[u.name],
      totalEarnings: user.totalEarnings,
      frozenBalance: user.frozenBalance,
      groupNum: user.groupNum
    });
    console.log(`${u.name}. ${userNames[u.name]} | 总收益¥${user.totalEarnings.toFixed(2)} | 冻结¥${user.frozenBalance.toFixed(2)}`);
  }

  // 排行榜
  console.log('\n【佣金排行榜】');
  results.sort((a, b) => b.totalEarnings - a.totalEarnings);
  results.forEach((r, i) => {
    console.log(`#${i+1} ${r.nickname} | ¥${r.totalEarnings.toFixed(2)} | 冻结¥${r.frozenBalance.toFixed(2)} | 团数${r.groupNum}`);
  });

  // 订单统计
  const allOrders = await Order.find({ orderNo: { $regex: /^CASE_2026/ } });
  const paidOrders = allOrders.filter(o => o.status === 'paid');
  console.log(`\n【订单】总${allOrders.length}单 已付款${paidOrders.length}单 收入¥${paidOrders.reduce((s,o) => s + o.totalAmount, 0)}`);

  console.log('\n========== 完成 ==========');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('错误:', err.message, err.stack);
  mongoose.disconnect();
  process.exit(1);
});
