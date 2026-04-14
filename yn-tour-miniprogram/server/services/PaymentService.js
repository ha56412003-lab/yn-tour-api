// 支付服务 - 微信支付和支付宝支付
const crypto = require('crypto')
const axios = require('axios')
const Order = require('../models/Order')

class PaymentService {
  /**
   * 微信小程序支付 - 创建订单
   */
  static async createWechatPayOrder(orderId) {
    try {
      const order = await Order.findById(orderId).populate('userId')
      if (!order) {
        return { success: false, message: '订单不存在' }
      }

      // 这里应该集成真实的微信支付SDK
      // 由于是演示，我们先模拟支付流程
      
      console.log(`[微信支付] 创建支付订单: ${order.orderNo}, 金额: ${order.totalAmount}`)
      
      // 模拟返回微信支付参数
      // 实际项目中，这里应该调用微信支付API
      const mockPayParams = {
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: crypto.randomBytes(16).toString('hex'),
        package: `prepay_id=mock_prepay_id_${order.orderNo}`,
        signType: 'MD5',
        paySign: this.generateMockSign()
      }

      return {
        success: true,
        data: {
          orderNo: order.orderNo,
          payParams: mockPayParams
        }
      }
    } catch (error) {
      console.error('[微信支付] 创建订单失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 支付宝支付 - 创建订单
   */
  static async createAlipayOrder(orderId) {
    try {
      const order = await Order.findById(orderId).populate('userId')
      if (!order) {
        return { success: false, message: '订单不存在' }
      }

      console.log(`[支付宝支付] 创建支付订单: ${order.orderNo}, 金额: ${order.totalAmount}`)
      
      // 模拟返回支付宝支付参数
      const mockPayParams = {
        orderString: `mock_alipay_order_string_${order.orderNo}`
      }

      return {
        success: true,
        data: {
          orderNo: order.orderNo,
          payParams: mockPayParams
        }
      }
    } catch (error) {
      console.error('[支付宝支付] 创建订单失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 微信支付回调处理
   */
  static async handleWechatPayCallback(callbackData) {
    try {
      // 验证签名（实际项目中需要）
      console.log('[微信支付] 收到支付回调:', callbackData)

      const { orderNo, transactionId } = callbackData
      
      // 查找订单
      const order = await Order.findOne({ orderNo })
      if (!order) {
        return { success: false, message: '订单不存在' }
      }

      if (order.status !== 'pending') {
        return { success: true, message: '订单已处理' }
      }

      // 更新订单状态
      order.status = 'paid'
      order.paymentMethod = 'wechat'
      order.paidAt = new Date()
      order.transactionId = transactionId
      await order.save()

      return { success: true, message: '支付成功' }
    } catch (error) {
      console.error('[微信支付] 回调处理失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 支付宝支付回调处理
   */
  static async handleAlipayCallback(callbackData) {
    try {
      console.log('[支付宝支付] 收到支付回调:', callbackData)

      const { orderNo, tradeNo } = callbackData
      
      const order = await Order.findOne({ orderNo })
      if (!order) {
        return { success: false, message: '订单不存在' }
      }

      if (order.status !== 'pending') {
        return { success: true, message: '订单已处理' }
      }

      order.status = 'paid'
      order.paymentMethod = 'alipay'
      order.paidAt = new Date()
      order.transactionId = tradeNo
      await order.save()

      return { success: true, message: '支付成功' }
    } catch (error) {
      console.error('[支付宝支付] 回调处理失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 查询支付状态
   */
  static async queryPaymentStatus(orderId) {
    try {
      const order = await Order.findById(orderId)
      if (!order) {
        return { success: false, message: '订单不存在' }
      }

      return {
        success: true,
        data: {
          orderNo: order.orderNo,
          status: order.status,
          paidAt: order.paidAt,
          paymentMethod: order.paymentMethod
        }
      }
    } catch (error) {
      console.error('[支付查询] 查询失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 模拟支付成功（用于测试）
   */
  static async mockPaymentSuccess(orderId, paymentMethod = 'wechat') {
    try {
      const order = await Order.findById(orderId)
      if (!order) {
        return { success: false, message: '订单不存在' }
      }

      if (order.status !== 'pending') {
        return { success: false, message: '订单状态异常' }
      }

      order.status = 'paid'
      order.paymentMethod = paymentMethod
      order.paidAt = new Date()
      order.transactionId = `mock_${paymentMethod}_${Date.now()}`
      await order.save()

      return { success: true, message: '模拟支付成功' }
    } catch (error) {
      console.error('[模拟支付] 失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 生成模拟签名
   */
  static generateMockSign() {
    return crypto.randomBytes(16).toString('hex')
  }
}

module.exports = PaymentService

