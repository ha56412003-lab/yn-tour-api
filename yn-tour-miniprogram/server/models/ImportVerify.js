// 导入审核模型
const mongoose = require('mongoose')

const importVerifySchema = new mongoose.Schema({
  // 用户信息
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: String,
  nickname: String,
  
  // 导入信息（仅保留核心三字段）
  importOrderNo: String,      // 外部平台订单号
  importSource: String,        // 来源平台（默认淘宝）
  
  // 审核状态: pending-待审核, approved-已通过, rejected-已拒绝
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  },
  
  // 审核信息
  reviewRemark: String,        // 审核备注
  reviewAt: Date,             // 审核时间
  reviewBy: String,          // 审核人
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('ImportVerify', importVerifySchema)
