// 手机号+短信验证码登录
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const DistributionService = require('../services/DistributionService')

// 模拟短信发送（生产环境替换为腾讯云/阿里云短信）
// 存储验证码：{ phone: { code, expiresAt } }
const smsCodeStore = new Map()

// 发送短信验证码
router.post('/send-sms-code', async (req, res) => {
  try {
    const { phone } = req.body
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({ code: 400, message: '请输入正确的手机号' })
    }
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 存储验证码（5分钟有效）
    smsCodeStore.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    })
    
    // TODO: 生产环境调用真实短信服务
    // await sendRealSMS(phone, code)
    console.log(`[短信] ${phone} 的验证码: ${code}`)
    
    res.json({
      code: 200,
      message: '验证码已发送',
      data: { expiresIn: 300 } // 5分钟
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 手机号+验证码登录
router.post('/phone-login', async (req, res) => {
  try {
    const { phone, code, referrerId } = req.body
    
    if (!phone || !code) {
      return res.json({ code: 400, message: '手机号和验证码不能为空' })
    }
    
    // 验证验证码
    const stored = smsCodeStore.get(phone)
    if (!stored) {
      return res.json({ code: 400, message: '请先获取验证码' })
    }
    if (Date.now() > stored.expiresAt) {
      smsCodeStore.delete(phone)
      return res.json({ code: 400, message: '验证码已过期，请重新获取' })
    }
    if (stored.code !== code) {
      return res.json({ code: 400, message: '验证码错误' })
    }
    
    // 验证成功后删除验证码
    smsCodeStore.delete(phone)
    
    // 查找或创建用户
    let user = await User.findOne({ phone })
    
    if (!user) {
      user = await User.create({
        openid: 'phone_' + phone,
        phone,
        nickname: '用户' + phone.slice(-4),
        avatar: '',
        isDistributor: true,
        distributorLevel: 1
      })
      
      // 如果有推荐人，绑定关系
      if (referrerId) {
        await DistributionService.bindParent(user._id, referrerId)
      }
    }
    
    res.json({
      code: 200,
      data: user
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 绑定手机号（已登录用户绑定手机）
router.post('/bind-phone', async (req, res) => {
  try {
    const { userId, phone, code } = req.body
    
    if (!userId) {
      return res.json({ code: 401, message: '请先登录' })
    }
    
    // 验证验证码
    const stored = smsCodeStore.get(phone)
    if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
      return res.json({ code: 400, message: '验证码错误或已过期' })
    }
    smsCodeStore.delete(phone)
    
    // 检查手机号是否已被其他用户绑定
    const existing = await User.findOne({ phone })
    if (existing && existing._id.toString() !== userId) {
      return res.json({ code: 400, message: '该手机号已绑定其他账号' })
    }
    
    const user = await User.findById(userId)
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    user.phone = phone
    await user.save()
    
    res.json({
      code: 200,
      data: user
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
