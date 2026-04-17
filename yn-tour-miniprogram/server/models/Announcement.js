const mongoose = require('mongoose')

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  type: { type: String, default: 'popup', enum: ['popup', 'banner'] },
  status: { type: Number, default: 1, enum: [0, 1] },
  showStart: { type: Date, default: null },
  showEnd: { type: Date, default: null },
  bgColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#333333' },
  priority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Announcement', AnnouncementSchema)
