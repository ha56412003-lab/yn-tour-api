// 提现记录模型
const mongoose = require('mongoose')

const withdrawSchema = new mongoose.Schema({
  withdrawNo: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // 提现金额
  amount: { type: Number, required: true },
  // 手续费
  fee: { type: Number, default: 0 },
  // 实际到账金额
  actualAmount: { type: Number, required: true },
  // 提现方式：wechat-微信, alipay-支付宝, bank-银行卡
  withdrawMethod: { 
    type: String, 
    enum: ['wechat', 'alipay', 'bank'],
    required: true 
  },
  // 收款账户信息
  accountInfo: {
    // 微信
    openid: { type: String },
    // 支付宝
    alipayAccount: { type: String },
    alipayName: { type: String },
    // 银行卡
    bankName: { type: String },
    bankAccount: { type: String },
    bankAccountName: { type: String }
  },
  // 状态：pending-待审核, approved-已审核, processing-处理中, completed-已完成, rejected-已拒绝
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected'],
    default: 'pending' 
  },
  // 审核信息
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectReason: { type: String },
  // 处理信息
  processedAt: { type: Date },
  // 完成信息
  completedAt: { type: Date },
  transactionId: { type: String }, // 第三方交易单号
  // 备注
  remark: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// 生成提现单号
withdrawSchema.statics.generateWithdrawNo = function() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `WTH${y}${m}${d}${random}`
}

module.exports = mongoose.model('Withdraw', withdrawSchema)

