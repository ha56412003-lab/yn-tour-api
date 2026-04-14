// 商品模型
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  images: [{ type: String }], // 图片URL列表
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // 原价
  // 行程信息
  duration: { type: String }, // 如 "6天5晚"
  destinations: [{ type: String }], // 目的地
  itinerary: [{
    day: Number,
    title: String,
    description: String
  }],
  // 费用说明
  feeInclude: [{ type: String }],
  feeExclude: [{ type: String }],
  // 分销设置（每个产品独立）
  commission: {
    level1: { type: Number, default: 0.3 }, // 一级分销比例 30%
    level2: { type: Number, default: 0.7 }  // 二级分销比例 70%
  },
  // 促销设置
  isPromotion: { type: Boolean, default: false },
  promotionPrice: { type: Number },
  promotionStart: { type: Date },
  promotionEnd: { type: Date },
  // 状态
  status: { type: Number, default: 1 }, // 1: 上架, 0: 下架
  sort: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Product', productSchema)
