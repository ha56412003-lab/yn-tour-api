// 行程内容模型（独立管理）
const mongoose = require('mongoose')

const itineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 第几天
  title: { type: String, required: true }, // 行程标题，如"昆明接机"
  description: { type: String }, // 行程描述
  meals: { type: String }, // 用餐安排，如"早中晚"
  tags: [{ type: String }] // 标签，如["玉龙雪山", "蓝月谷"]
})

const itinerarySchema = new mongoose.Schema({
  name: { type: String, required: true }, // 行程名称，如"云南6天5晚轻奢游"
  description: { type: String }, // 行程简介
  duration: { type: String }, // 如 "6天5晚"
  destinations: [{ type: String }], // 目的地列表
  days: [itineraryDaySchema], // 每日行程
  feeInclude: [{ type: String }], // 费用包含
  feeExclude: [{ type: String }], // 费用不含
  highlights: [{ // 产品亮点
    icon: { type: String },
    text: { type: String }
  }],
  notices: [{ type: String }], // 出行须知
  status: { type: Number, default: 1 }, // 1: 启用, 0: 禁用
  sort: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Itinerary', itinerarySchema)
