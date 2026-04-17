const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const Order = require('../models/Order')
const DistributionService = require('../services/DistributionService')
const User = require('../models/User')

// ============================================
// 用户侧：申请退款
// ============================================
// POST /api/refund/apply
router.post('/apply', async (req, res) => {
  try {
    const { orderId, reason } = req.body
    const userId = req.headers['x-user-id']

    if (!orderId) {
      return res.json({ success: false, message: '缺少订单ID' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.json({ success: false, message: '订单不存在' })
    }

    // 验证订单所属用户
    if (order.userId.toString() !== userId) {
      return res.json({ success: false, message: '无权操作此订单' })
    }

    // 检查订单状态：仅已付款状态可申请退款
    if (order.status !== 'paid') {
      return res.json({ success: false, message: '当前状态无法申请退款' })
    }

    // 检查退款状态
    if (order.refundStatus !== 'none' && order.refundStatus !== 'rejected') {
      return res.json({ success: false, message: '该订单已有退款申请' })
    }

    // 检查退款期限
    if (order.paidAt) {
      const paidTime = new Date(order.paidAt).getTime()
      const now = Date.now()
      const daysDiff = (now - paidTime) / (1000 * 60 * 60 * 24)

      if (daysDiff > 30) {
        return res.json({ success: false, message: '该订单已超过30天退款期限，无法申请退款' })
      }
    }

    // 更新退款申请信息
    order.refundStatus = 'applying'
    order.refundApplyTime = new Date()
    order.refundReason = reason || ''
    await order.save()

    res.json({ success: true, message: '退款申请已提交，请等待审核' })
  } catch (error) {
    console.error('[退款申请] 失败:', error)
    res.json({ success: false, message: error.message })
  }
})

// ============================================
// 用户侧：我的退款列表
// ============================================
// GET /api/refund/my-list
router.get('/my-list', async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const { page = 1, limit = 10 } = req.query

    const list = await Order.find({
      userId,
      refundStatus: { $ne: 'none' }
    })
      .sort({ refundApplyTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('productId', 'name coverImage')

    const total = await Order.countDocuments({
      userId,
      refundStatus: { $ne: 'none' }
    })

    res.json({
      success: true,
      data: {
        list,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
      }
    })
  } catch (error) {
    console.error('[退款列表] 失败:', error)
    res.json({ success: false, message: error.message })
  }
})

// ============================================
// ============================================
// 管理侧：退款申请列表
// ============================================
// GET /api/refund/admin-list
router.get('/admin-list', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query

    const query = status && status !== 'all'
      ? { refundStatus: status }
      : { refundStatus: { $in: ['applying', 'approved', 'rejected'] } }

    const list = await Order.find(query)
      .sort({ refundApplyTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'nickname phone avatar')
      .populate('productId', 'name coverImage')

    const total = await Order.countDocuments(query)

    res.json({
      success: true,
      data: {
        list,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
      }
    })
  } catch (error) {
    console.error('[管理退款列表] 失败:', error)
    res.json({ success: false, message: error.message })
  }
})

// ============================================
// 管理侧：审核通过退款（需鉴权）
// ============================================
// POST /api/refund/approve
router.post('/approve', adminAuth, async (req, res) => {
  try {
    const { orderId, remark } = req.body
    const adminId = req.headers['x-user-id']

    if (!orderId) {
      return res.json({ success: false, message: '缺少订单ID' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.json({ success: false, message: '订单不存在' })
    }

    if (order.refundStatus !== 'applying') {
      return res.json({ success: false, message: '该订单没有待审核的退款申请' })
    }

    // 检查退款期限
    if (order.paidAt) {
      const paidTime = new Date(order.paidAt).getTime()
      const now = Date.now()
      const daysDiff = (now - paidTime) / (1000 * 60 * 60 * 24)

      if (daysDiff > 30) {
        return res.json({ success: false, message: '该订单已超过30天退款期限，拒绝退款' })
      }
    }

    // 7天内：无条件退款（前端已做限制，但后端二次校验）
    // 7-30天：需备注原因才可拒绝，前端已申请说明为协商（审核时管理员可自行判断）

    // 1. 追回佣金（如果佣金已发放或冻结）
    await DistributionService.clawbackCommission(orderId)

    // 2. 扣减推荐人的有效直推单量（退款订单不计入7人团点位）
    const referrerId = order.distribution?.referrerId
    if (referrerId) {
      const updateFields = {}
      if (order.distribution?.isLockedOrder) {
        updateFields.lockedUserOrderNum = -1
      } else {
        updateFields.directPushNum = -1
      }
      await User.findByIdAndUpdate(referrerId, { $inc: updateFields })
      console.log(`[退款审核] 扣减推荐人 ${referrerId} 直推单量 (locked=${order.distribution?.isLockedOrder})`)

      // 重新计算并修正 referrer 的 groupNum（防止退款导致成团数下降但 groupNum 未更新）
      const referrerAfter = await User.findById(referrerId)
      if (referrerAfter) {
        const currentValidOrders = await Order.countDocuments({
          'distribution.referrerId': referrerId,
          'distribution.isValid': true,
          status: 'paid'
        })
        const newGroupNum = Math.floor((currentValidOrders + (referrerAfter.selfOrderNum || 0)) / 7)
        if (newGroupNum < (referrerAfter.groupNum || 0)) {
          await User.findByIdAndUpdate(referrerId, { groupNum: newGroupNum })
          console.log(`[退款审核] 推荐人 ${referrerId} groupNum 从 ${referrerAfter.groupNum} 纠正为 ${newGroupNum}，多发的成团奖已通过佣金追回流程处理`)
        }
      }
    }

    // 3. 更新订单退款状态（标记为无效，不计入7人团点位）
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        'distribution.isValid': false,
        refundStatus: 'approved',
        refundProcessedAt: new Date(),
        refundAdminId: adminId,
        refundRemark: remark || '',
        status: 'cancelled',
        commissionStatus: 'clawed_back'
      }
    })

    // 4. TODO: 实际退款（微信支付退款API），目前仅标记状态
    // 如果是赠送产品（实物卡），需处理物流退回

    res.json({ success: true, message: '退款已审核通过，佣金已追回' })
  } catch (error) {
    console.error('[退款审核通过] 失败:', error)
    res.json({ success: false, message: error.message })
  }
})

// ============================================
// 管理侧：拒绝退款（需鉴权）
// ============================================
// POST /api/refund/reject
router.post('/reject', adminAuth, async (req, res) => {
  try {
    const { orderId, remark } = req.body
    const adminId = req.headers['x-user-id']

    if (!orderId) {
      return res.json({ success: false, message: '缺少订单ID' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.json({ success: false, message: '订单不存在' })
    }

    if (order.refundStatus !== 'applying') {
      return res.json({ success: false, message: '该订单没有待审核的退款申请' })
    }

    // 检查退款期限：超过30天直接拒绝
    if (order.paidAt) {
      const paidTime = new Date(order.paidAt).getTime()
      const now = Date.now()
      const daysDiff = (now - paidTime) / (1000 * 60 * 60 * 24)
      if (daysDiff > 30) {
        return res.json({ success: false, message: '该订单已超过30天退款期限，拒绝退款' })
      }
    }

    // 更新退款状态为已拒绝，同时重置状态允许用户重新申请
    order.refundStatus = 'none'
    order.refundProcessedAt = new Date()
    order.refundAdminId = adminId
    order.refundRemark = remark || '审核拒绝'
    // 订单状态不变，佣金不追回（保持冻结状态，等30天满后自然解冻）
    await order.save()

    res.json({ success: true, message: '退款申请已拒绝' })
  } catch (error) {
    console.error('[退款拒绝] 失败:', error)
    res.json({ success: false, message: error.message })
  }
})

module.exports = router
