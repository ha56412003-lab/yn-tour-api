// 首页装修配置模型
const mongoose = require('mongoose')

const homeConfigSchema = new mongoose.Schema({
  // 首页海报图片
  bannerImage: { type: String, default: '' },
  // 关联的产品ID
  linkedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  // 关联的产品名称（冗余存储，方便展示）
  linkedProductName: { type: String, default: '' },
  // 专属管家电话（多个逗号分隔）
  butlerPhones: { type: String, default: '' },
  // 专属管家微信（多个逗号分隔）
  butlerWechats: { type: String, default: '' },
  // 公众号文章链接（关联"关注公众号"跳转）
  officialAccountUrl: { type: String, default: '' },
  // 排序
  sort: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('HomeConfig', homeConfigSchema)
