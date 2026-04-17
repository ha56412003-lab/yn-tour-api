const mongoose = require('mongoose')

const backgroundSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  url: { type: String, required: true },
  status: { type: Number, default: 1 }, // 1=启用 0=禁用
  sort: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Background', backgroundSchema)
