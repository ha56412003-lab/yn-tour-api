// 商品模型
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  mainImages: [{ type: String }], // 产品主图（轮播图），建议 800x800，建议1-5张
  detailImages: [{ type: String }], // 产品详情图，建议 720x1000 高度切片
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // 原价
  // 行程关联（独立行程内容）
  itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
  // 以下字段保留用于兼容旧数据（新产品建议使用独立行程）
  duration: { type: String }, // 如 "6天5晚"
  destinations: [{ type: String }], // 目的地
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    meals: String,  // 如"早中晚"
    tags: [String]  // 如["玉龙雪山", "蓝月谷"]
  }],
  // 费用说明
  feeInclude: [{ type: String }],
  feeExclude: [{ type: String }],
  // 产品亮点
  highlights: [{
    icon: { type: String },
    text: { type: String }
  }],
  // 出行须知
  notices: [{ type: String }],
  // 分销设置
  distributionEnabled: { type: Boolean, default: false }, // 是否参与279分销计划
  commission: {
    level1: { type: Number, default: 0.3 }, // 直推奇数单佣金比例
    level2: { type: Number, default: 0.7 }  // 直推偶数单佣金比例
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
