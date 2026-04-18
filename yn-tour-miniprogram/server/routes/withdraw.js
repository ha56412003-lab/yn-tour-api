// 提现相关API
const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const userAuth = require('../middleware/userAuth')
const WithdrawService = require('../services/WithdrawService')

// 用户申请提现（需要登录）
router.post('/apply', userAuth, async (req, res) => {
  try {
    // 从 JWT token 获取用户ID，不再从 body 接收
    const userId = req.headers['x-user-id']
    const { withdrawMethod, accountInfo, amount } = req.body
    
    if (!userId) {
      return res.json({ code: 401, message: '请先登录' })
    }
    
    const result = await WithdrawService.applyWithdraw(userId, withdrawMethod, accountInfo, amount)
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      message: result.message,
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取当前用户的提现记录（需要登录）
router.get('/list', userAuth, async (req, res) => {
  try {
    // 从 JWT token 获取用户ID
    const userId = req.headers['x-user-id']
    const { page = 1, limit = 20, status = 'all' } = req.query
    
    if (!userId) {
      return res.json({ code: 401, message: '请先登录' })
    }
    
    const result = await WithdrawService.getUserWithdrawList(userId, parseInt(page), parseInt(limit), status)
    
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

// 获取提现详情（需要登录，只能查看自己的）
router.get('/detail', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const { withdrawId } = req.query
    
    if (!userId) {
      return res.json({ code: 401, message: '请先登录' })
    }
    
    const result = await WithdrawService.getWithdrawDetail(withdrawId, userId)
    
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

// 管理后台 - 审核提现
router.post('/approve', adminAuth, async (req, res) => {
  try {
    const { withdrawId, approved, rejectReason } = req.body
    
    const result = await WithdrawService.approveWithdraw(withdrawId, approved, rejectReason)
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      message: result.message,
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 管理后台 - 处理提现（打款）
router.post('/process', adminAuth, async (req, res) => {
  try {
    const { withdrawId } = req.body
    
    const result = await WithdrawService.processWithdraw(withdrawId)
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      message: result.message,
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 管理后台 - 获取所有提现记录
router.get('/admin-list', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query
    
    const result = await WithdrawService.getAdminWithdrawList(parseInt(page), parseInt(limit), status)
    
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

module.exports = router
