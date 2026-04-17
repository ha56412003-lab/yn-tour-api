// 出行花絮评价管理API
const express = require('express')
const router = express.Router()
const Review = require('../models/Review')

// 获取评价列表（管理后台）
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 50, show } = req.query
    const query = {}
    if (show !== undefined) query.show = show === 'true'
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [list, total] = await Promise.all([
      Review.find(query).sort({ sort: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Review.countDocuments(query),
    ])
    res.json({ code: 200, data: { list, total, page: parseInt(page), limit: parseInt(limit) } })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取评价列表（小程序用，只返回 show=true）
router.get('/public', async (req, res) => {
  try {
    const list = await Review.find({ show: true }).sort({ sort: -1, createdAt: -1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 新增评价
router.post('/create', async (req, res) => {
  try {
    const { image, avatar, nickname, rating, content, show, sort } = req.body
    if (!image || !avatar || !nickname || !content) {
      return res.json({ code: 400, message: '缺少必填字段' })
    }
    const review = await Review.create({ image, avatar, nickname, rating: rating || 5, content, show: show !== false, sort: sort || 0 })
    res.json({ code: 200, data: review })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 更新评价
router.post('/update', async (req, res) => {
  try {
    const { reviewId, image, avatar, nickname, rating, content, show, sort } = req.body
    if (!reviewId) return res.json({ code: 400, message: '缺少reviewId' })
    const updateData = {}
    ;['image', 'avatar', 'nickname', 'rating', 'content', 'show', 'sort'].forEach(k => {
      if (req.body[k] !== undefined) updateData[k] = req.body[k]
    })
    updateData.updatedAt = new Date()
    const updated = await Review.findByIdAndUpdate(reviewId, updateData, { new: true })
    res.json({ code: 200, data: updated })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 删除评价
router.post('/delete', async (req, res) => {
  try {
    const { reviewId } = req.body
    if (!reviewId) return res.json({ code: 400, message: '缺少reviewId' })
    await Review.findByIdAndDelete(reviewId)
    res.json({ code: 200 })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
