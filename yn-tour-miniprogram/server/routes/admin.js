// 管理后台API
const express = require('express')
const router = express.Router()
const AdminService = require('../services/AdminService')

// 获取数据看板
router.get('/dashboard', async (req, res) => {
  try {
    const result = await AdminService.getDashboardStats()
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取用户列表
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword = '' } = req.query
    
    const result = await AdminService.getUserList(parseInt(page), parseInt(limit), keyword)
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取订单列表
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', keyword = '' } = req.query
    
    const result = await AdminService.getOrderList(parseInt(page), parseInt(limit), status, keyword)
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取营收统计
router.get('/revenue-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    const result = await AdminService.getRevenueStats(startDate, endDate)
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 更新每日统计
router.post('/update-daily-stats', async (req, res) => {
  try {
    const { date } = req.body
    
    const result = await AdminService.updateDailyStats(date ? new Date(date) : new Date())
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      message: '统计更新成功',
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取用户详情（包括团队信息）
router.get('/user-detail', async (req, res) => {
  try {
    const { userId } = req.query
    const User = require('../models/User')
    const DistributionService = require('../services/DistributionService')
    
    const user = await User.findById(userId)
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    // 获取用户收益
    const earnings = await DistributionService.getUserEarnings(userId)
    
    // 获取团队成员
    const teamMembers = await User.find({
      $or: [
        { parentId: userId },
        { lockedBy: userId }
      ]
    }).select('nickname avatar phone selfOrderNum directPushNum totalTeamOrders groupNum createdAt')
    
    res.json({
      code: 200,
      data: {
        user,
        earnings: earnings.data,
        teamMembers,
        teamCount: teamMembers.length
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router

