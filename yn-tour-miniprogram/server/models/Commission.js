// 佣金记录模型
const mongoose = require('mongoose')

const commissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  // 佣金类型: direct-直推, indirect-间推, signIn-签到, bonus-奖励
  type: { 
    type: String, 
    enum: ['direct', 'indirect', 'signIn', 'bonus'],
    required: true 
  },
  amount: { type: Number, required: true },
  // 订单金额（用于计算比例）
  orderAmount: { type: Number },
  // 关联用户（如果是分销佣金，记录是谁带来的订单）
  relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // 分销层级
  level: { type: Number }, // 1: 一级, 2: 二级
  // 状态: pending-待结算, settled-已结算, frozen-冻结
  status: { 
    type: String, 
    enum: ['pending', 'settled', 'frozen'],
    default: 'pending' 
  },
  // 结算时间
  settledAt: { type: Date },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Commission', commissionSchema)
