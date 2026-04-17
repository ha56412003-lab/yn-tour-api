// 提现相关API
const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const WithdrawService = require('../services/WithdrawService')

// 用户申请提现
router.post('/apply', async (req, res) => {
  try {
    const { userId, withdrawMethod, accountInfo, amount } = req.body
    
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

// 获取用户提现记录
router.get('/list', async (req, res) => {
  try {
    const { userId, page = 1, limit = 20, status = 'all' } = req.query
    
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

// 获取提现详情
router.get('/detail', async (req, res) => {
  try {
    const { withdrawId } = req.query
    
    const result = await WithdrawService.getWithdrawDetail(withdrawId)
    
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

