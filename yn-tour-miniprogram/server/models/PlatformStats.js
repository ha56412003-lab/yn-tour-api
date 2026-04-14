// 平台统计模型
const mongoose = require('mongoose')

const platformStatsSchema = new mongoose.Schema({
  // 统计日期（按天统计）
  date: { type: Date, required: true, unique: true },
  // 用户统计
  userStats: {
    totalUsers: { type: Number, default: 0 },      // 总用户数
    newUsers: { type: Number, default: 0 },        // 新增用户数
    activeUsers: { type: Number, default: 0 },     // 活跃用户数
    distributors: { type: Number, default: 0 }     // 分销商数
  },
  // 订单统计
  orderStats: {
    totalOrders: { type: Number, default: 0 },     // 总订单数
    newOrders: { type: Number, default: 0 },       // 新增订单数
    paidOrders: { type: Number, default: 0 },      // 已支付订单数
    totalAmount: { type: Number, default: 0 },     // 总交易额
    paidAmount: { type: Number, default: 0 }       // 已支付金额
  },
  // 分销统计
  distributionStats: {
    totalCommission: { type: Number, default: 0 },   // 总佣金支出
    settledCommission: { type: Number, default: 0 }, // 已结算佣金
    groupBonus: { type: Number, default: 0 },         // 成团奖支出
    dividend: { type: Number, default: 0 },           // 分红支出
    visitAward: { type: Number, default: 0 }          // 访问奖支出
  },
  // 提现统计
  withdrawStats: {
    totalWithdraws: { type: Number, default: 0 },     // 总提现次数
    totalWithdrawAmount: { type: Number, default: 0 }, // 总提现金额
    completedWithdraws: { type: Number, default: 0 },  // 已完成提现次数
    completedAmount: { type: Number, default: 0 }      // 已完成提现金额
  },
  // 平台总营业额（用于分红计算）
  platformTotalRevenue: { type: Number, default: 0 },
  // 平台合格总单量（用于分红计算）
  platformQualifiedTotalOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// 按日期索引
platformStatsSchema.index({ date: 1 })

module.exports = mongoose.model('PlatformStats', platformStatsSchema)

