// 访问记录模型（用于有效访问奖）
const mongoose = require('mongoose')

const visitRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // 访客信息（如果是未登录用户）
  visitorId: { type: String },
  // 访问的页面/商品
  targetType: { type: String, enum: ['product', 'page', 'home'], default: 'home' },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // 商品ID等
  // 访问来源（分销链接）
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 推荐人ID
  // 是否有效访问（用于计算奖励）
  isValid: { type: Boolean, default: false },
  // 访问时长（秒）
  duration: { type: Number, default: 0 },
  // IP地址
  ip: { type: String },
  // User-Agent
  userAgent: { type: String },
  // 设备信息
  device: {
    type: { type: String }, // mobile, desktop, tablet
    brand: { type: String },
    model: { type: String }
  },
  // 地理位置
  location: {
    country: { type: String },
    province: { type: String },
    city: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
})

// 索引
visitRecordSchema.index({ userId: 1, createdAt: -1 })
visitRecordSchema.index({ referrerId: 1, createdAt: -1 })
visitRecordSchema.index({ createdAt: -1 })

module.exports = mongoose.model('VisitRecord', visitRecordSchema)

