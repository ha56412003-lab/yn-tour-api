// 订单相关API
const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')
const DistributionService = require('../services/DistributionService')
const PaymentService = require('../services/PaymentService')

// 创建订单
router.post('/create', async (req, res) => {
  try {
    const { userId, productId, quantity, travelers, travelDate, referrerId } = req.body
    
    // 获取商品信息
    const product = await Product.findById(productId)
    if (!product) {
      return res.json({ code: 404, message: '商品不存在' })
    }
    
    // 获取用户信息
    const user = await User.findById(userId)
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    // 生成订单号
    const orderNo = await Order.generateOrderNo()
    
    // 计算订单金额
    const totalAmount = product.price * quantity
    
    // 创建订单
    const orderData = {
      orderNo,
      userId,
      productId,
      productName: product.name,
      productPrice: product.price,
      quantity,
      totalAmount,
      travelers,
      travelDate,
      status: 'pending',
      'distribution.isSelfOrder': user.selfOrderNum === 0 // 如果是第一单，标记为自购单
    }
    
    // 如果有推荐人，保存推荐人信息
    if (referrerId) {
      orderData['distribution.referrerId'] = referrerId
    } else if (user.parentId) {
      orderData['distribution.referrerId'] = user.parentId
    } else if (user.isLocked && user.lockedBy) {
      orderData['distribution.referrerId'] = user.lockedBy
      orderData['distribution.isLockedOrder'] = true
    }
    
    const order = await Order.create(orderData)
    
    res.json({
      code: 200,
      data: order
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 创建支付订单
router.post('/create-payment', async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body
    
    let result
    if (paymentMethod === 'wechat') {
      result = await PaymentService.createWechatPayOrder(orderId)
    } else if (paymentMethod === 'alipay') {
      result = await PaymentService.createAlipayOrder(orderId)
    } else {
      return res.json({ code: 400, message: '不支持的支付方式' })
    }
    
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

// 模拟支付成功（用于测试）
router.post('/mock-pay', async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body
    
    const result = await PaymentService.mockPaymentSuccess(orderId, paymentMethod)
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    // 支付成功后，计算分销佣金
    await DistributionService.calculateCommission(orderId)
    
    // 如果是用户第一次下单，自动锁客
    const order = await Order.findById(orderId).populate('userId')
    if (order && order.userId.selfOrderNum === 1 && order.distribution.referrerId) {
      await DistributionService.lockUser(order.userId._id, order.distribution.referrerId)
    }
    
    res.json({
      code: 200,
      message: '支付成功'
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 微信支付回调
router.post('/wechat-callback', async (req, res) => {
  try {
    const result = await PaymentService.handleWechatPayCallback(req.body)
    
    if (result.success) {
      // 计算分销佣金
      const order = await Order.findOne({ orderNo: req.body.orderNo })
      if (order) {
        await DistributionService.calculateCommission(order._id)
        
        // 如果是用户第一次下单，自动锁客
        const buyer = await User.findById(order.userId)
        if (buyer && buyer.selfOrderNum === 1 && order.distribution.referrerId) {
          await DistributionService.lockUser(buyer._id, order.distribution.referrerId)
        }
      }
    }
    
    res.json({ code: result.success ? 200 : 400, message: result.message })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 支付宝支付回调
router.post('/alipay-callback', async (req, res) => {
  try {
    const result = await PaymentService.handleAlipayCallback(req.body)
    
    if (result.success) {
      // 计算分销佣金
      const order = await Order.findOne({ orderNo: req.body.orderNo })
      if (order) {
        await DistributionService.calculateCommission(order._id)
        
        // 如果是用户第一次下单，自动锁客
        const buyer = await User.findById(order.userId)
        if (buyer && buyer.selfOrderNum === 1 && order.distribution.referrerId) {
          await DistributionService.lockUser(buyer._id, order.distribution.referrerId)
        }
      }
    }
    
    res.json({ code: result.success ? 200 : 400, message: result.message })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 查询支付状态
router.get('/pay-status', async (req, res) => {
  try {
    const { orderId } = req.query
    
    const result = await PaymentService.queryPaymentStatus(orderId)
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
router.get('/list', async (req, res) => {
  try {
    const { userId, status, page = 1, limit = 20 } = req.query
    
    const query = { userId }
    if (status && status !== 'all') {
      query.status = status
    }
    
    const list = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    const total = await Order.countDocuments(query)
    
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

// 获取订单详情
router.get('/detail', async (req, res) => {
  try {
    const { orderId } = req.query
    
    const order = await Order.findById(orderId).populate('userId', 'nickname')
    
    if (!order) {
      return res.json({ code: 404, message: '订单不存在' })
    }
    
    res.json({
      code: 200,
      data: order
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 取消订单
router.post('/cancel', async (req, res) => {
  try {
    const { orderId } = req.body
    
    const order = await Order.findById(orderId)
    if (!order) {
      return res.json({ code: 404, message: '订单不存在' })
    }
    
    if (order.status !== 'pending') {
      return res.json({ code: 400, message: '订单无法取消' })
    }
    
    order.status = 'cancelled'
    await order.save()
    
    res.json({
      code: 200,
      message: '订单已取消'
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 发货（旅游卡邮寄）
router.post('/ship', async (req, res) => {
  try {
    const { orderId, expressCompany, expressNo } = req.body
    
    const order = await Order.findById(orderId)
    if (!order) {
      return res.json({ code: 404, message: '订单不存在' })
    }
    
    if (order.status !== 'paid') {
      return res.json({ code: 400, message: '订单未支付，无法发货' })
    }
    
    if (!expressCompany || !expressNo) {
      return res.json({ code: 400, message: '请填写快递公司和单号' })
    }
    
    order.expressCompany = expressCompany
    order.expressNo = expressNo
    order.shippedAt = new Date()
    order.deliveryStatus = 'shipped'
    order.status = 'processing' // 支付后进入处理中状态
    await order.save()
    
    res.json({
      code: 200,
      message: '发货成功',
      data: {
        expressCompany,
        expressNo,
        shippedAt: order.shippedAt
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
