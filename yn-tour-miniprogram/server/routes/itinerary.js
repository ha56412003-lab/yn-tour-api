// 行程内容API（独立管理）
const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const Itinerary = require('../models/Itinerary')

// 获取行程列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query

    const query = status !== undefined ? { status: parseInt(status) } : {}

    const list = await Itinerary.find(query)
      .sort({ sort: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await Itinerary.countDocuments(query)

    res.json({
      code: 200,
      data: {
        list,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取行程详情
router.get('/detail', async (req, res) => {
  try {
    const { itineraryId } = req.query
    
    const itinerary = await Itinerary.findById(itineraryId)
    
    if (!itinerary) {
      return res.json({ code: 404, message: '行程不存在' })
    }
    
    res.json({
      code: 200,
      data: itinerary
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取所有行程（管理后台用，不分页，下拉框选择）
router.get('/all', async (req, res) => {
  try {
    const list = await Itinerary.find({ status: 1 }).sort({ sort: 1, createdAt: -1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 创建行程（管理员）
router.post('/create', adminAuth, async (req, res) => {
  try {
    const data = req.body
    const itinerary = await Itinerary.create({
      ...data,
      updatedAt: new Date()
    })
    res.json({ code: 200, data: itinerary, message: '创建成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 更新行程（管理员）
router.post('/update', adminAuth, async (req, res) => {
  try {
    const { itineraryId, ...updates } = req.body
    updates.updatedAt = new Date()
    
    const itinerary = await Itinerary.findByIdAndUpdate(
      itineraryId,
      updates,
      { new: true }
    )
    
    if (!itinerary) {
      return res.json({ code: 404, message: '行程不存在' })
    }
    
    res.json({ code: 200, data: itinerary, message: '更新成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 删除行程（管理员）
router.post('/delete', adminAuth, async (req, res) => {
  try {
    const { itineraryId } = req.body
    
    const itinerary = await Itinerary.findByIdAndDelete(itineraryId)
    
    if (!itinerary) {
      return res.json({ code: 404, message: '行程不存在' })
    }
    
    res.json({ code: 200, message: '删除成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
