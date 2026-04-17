// 导入审核相关API
const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const ImportVerify = require('../models/ImportVerify')
const User = require('../models/User')

// 提交导入申请（用户端）
router.post('/submit', async (req, res) => {
  try {
    const { userId, phone, nickname, importOrderNo, importSource } = req.body
    
    // 基本校验
    if (!phone || !importOrderNo) {
      return res.json({ code: 400, message: '手机号和订单号不能为空' })
    }
    
    // 检查是否已经是分销商
    if (userId) {
      const user = await User.findById(userId)
      if (user && user.isDistributor) {
        return res.json({ code: 400, message: '您已经是分销商，无需重复申请' })
      }
    }
    
    // 检查是否有待审核的申请
    const existing = await ImportVerify.findOne({ phone, status: 'pending' })
    if (existing) {
      return res.json({ code: 400, message: '您有待审核的申请，请耐心等待' })
    }
    
    // 创建审核记录
    const verify = await ImportVerify.create({
      userId,
      phone,
      nickname: nickname || '用户',
      importOrderNo,
      importSource: importSource || '淘宝'
    })
    
    res.json({
      code: 200,
      message: '提交成功，请等待审核',
      data: { id: verify._id }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 查询审核状态（用户端）
router.get('/status', async (req, res) => {
  try {
    const { userId, phone } = req.query
    
    const query = userId ? { userId } : { phone }
    const verify = await ImportVerify.findOne(query).sort({ createdAt: -1 })
    
    if (!verify) {
      return res.json({ code: 404, message: '暂无申请记录' })
    }
    
    res.json({
      code: 200,
      data: verify
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取导入审核列表（管理端）
router.get('/list', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    
    const query = {}
    if (status && status !== 'all') {
      query.status = status
    }
    
    const list = await ImportVerify.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    const total = await ImportVerify.countDocuments(query)
    
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

// 审核通过
router.post('/approve', adminAuth, async (req, res) => {
  try {
    const { id, reviewRemark } = req.body
    
    const verify = await ImportVerify.findById(id)
    if (!verify) {
      return res.json({ code: 404, message: '申请不存在' })
    }
    
    if (verify.status !== 'pending') {
      return res.json({ code: 400, message: '该申请已处理' })
    }
    
    // 更新审核状态
    verify.status = 'approved'
    verify.reviewRemark = reviewRemark || ''
    verify.reviewAt = new Date()
    await verify.save()
    
    // 如果有绑定用户，将用户设为分销商
    if (verify.userId) {
      await User.findByIdAndUpdate(verify.userId, {
        isDistributor: true,
        distributorLevel: 1,
        isImported: true,
        importOrderNo: verify.importOrderNo,
        importSource: verify.importSource,
        importedAt: new Date()
      })
    } else if (verify.phone) {
      // 按手机号查找用户并更新
      await User.findOneAndUpdate(
        { phone: verify.phone },
        {
          isDistributor: true,
          distributorLevel: 1,
          isImported: true,
          importOrderNo: verify.importOrderNo,
          importSource: verify.importSource,
          importedAt: new Date()
        }
      )
    }
    
    res.json({
      code: 200,
      message: '审核通过，用户已成为分销商'
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 审核拒绝
router.post('/reject', adminAuth, async (req, res) => {
  try {
    const { id, reviewRemark } = req.body
    
    const verify = await ImportVerify.findById(id)
    if (!verify) {
      return res.json({ code: 404, message: '申请不存在' })
    }
    
    if (verify.status !== 'pending') {
      return res.json({ code: 400, message: '该申请已处理' })
    }
    
    verify.status = 'rejected'
    verify.reviewRemark = reviewRemark || ''
    verify.reviewAt = new Date()
    await verify.save()
    
    res.json({
      code: 200,
      message: '已拒绝'
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
