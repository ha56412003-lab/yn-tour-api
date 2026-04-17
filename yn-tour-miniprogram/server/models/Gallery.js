// 产品素材/花絮图片模型
const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  category: { type: String, default: 'scene' }, // scene-风景 / food-美食 / hotel-住宿 / experience-体验
  title: { type: String }, // 图片标题/描述
  location: { type: String }, // 地点
  scene: { type: String }, // 场景描述
  url: { type: String, required: true }, // 图片URL
  sort: { type: Number, default: 0 }, // 排序
  status: { type: Number, default: 1 }, // 1-显示 0-隐藏
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Gallery', gallerySchema)
