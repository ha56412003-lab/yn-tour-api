const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  image: { type: String, required: true },       // 花絮图片URL
  avatar: { type: String, required: true },      // 买家头像URL
  nickname: { type: String, required: true },    // 买家昵称
  rating: { type: Number, default: 5, min: 1, max: 5 },  // 评分 1-5
  content: { type: String, required: true },      // 评价内容
  show: { type: Boolean, default: true },         // 是否显示
  sort: { type: Number, default: 0 },             // 排序
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Review', reviewSchema)
