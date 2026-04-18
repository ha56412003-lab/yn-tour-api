// 管理后台API
const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const AdminService = require('../services/AdminService')
const DistributionService = require('../services/DistributionService')
const Order = require('../models/Order')
const User = require('../models/User')

// 所有管理后台路由需先通过鉴权
router.use(adminAuth)

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

// 导出待发货订单（CSV）
router.get('/orders/export', async (req, res) => {
  try {
    const { status = 'paid' } = req.query
    const result = await AdminService.exportOrders(status)
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    const orders = result.data
    
    // CSV表头（ERP标准格式 — 匹配管易ERP模板48列）
    // eslint-disable-next-line max-len
    const headers = ['店铺', '平台单号', '买家会员', '支付金额', '商品名称', '商品代码', '规格代码', '规格名称', '是否赠品', '数量', '价格', '商品备注', '运费', '买家留言', '收货人', '联系电话', '联系手机', '收货地址', '省', '市', '区', '邮编', '订单创建时间', '订单付款时间', '发货时间', '物流单号', '物流公司', '卖家备注', '发票种类', '发票类型', '发票抬头', '纳税人识别号', '开户行', '账号', '地址', '电话', '是否手机订单', '是否货到付款', '支付方式', '支付交易号', '真实姓名', '身份证号', '仓库名称', '预计发货时间', '预计送达时间', '订单类型', '是否分销商订单', '业务员']

    const rows = orders.map(o => {
      const addr = o.deliveryAddress || {}
      const user = o.userId || {}
      const buyerName = user.nickname || user.username || user.phone || ''
      // 支付方式映射
      const payMethodMap = { wechat: '微信支付', alipay: '支付宝' }
      const payMethod = payMethodMap[o.paymentMethod] || o.paymentMethod || '微信支付'
      // 订单类型：旅游卡->虚拟产品
      const orderType = '虚拟产品'

      return [
        '哈哈哈哈旅行',       // 店铺
        o.orderNo || '',      // 平台单号
        buyerName,            // 买家会员
        o.totalAmount || 0,   // 支付金额
        o.productName || '',  // 商品名称
        '',                   // 商品代码（留空）
        '',                   // 规格代码
        '',                   // 规格名称
        '0',                  // 是否赠品
        o.quantity || 1,     // 数量
        o.productPrice || 0, // 价格
        '',                   // 商品备注
        '0',                  // 运费（旅游卡包邮）
        o.remark || '', // 买家留言（订单备注）
        addr.receiverName || '',     // 收货人
        addr.receiverPhone || '',    // 联系电话
        addr.receiverPhone || '',    // 联系手机
        addr.fullAddress || '',      // 收货地址
        addr.province || '',          // 省
        addr.city || '',              // 市
        addr.district || '',          // 区
        '',                           // 邮编（留空）
        o.createdAt ? new Date(o.createdAt).toLocaleString('zh-CN') : '', // 订单创建时间
        o.paidAt ? new Date(o.paidAt).toLocaleString('zh-CN') : '',        // 订单付款时间
        o.shippedAt ? new Date(o.shippedAt).toLocaleString('zh-CN') : '',  // 发货时间
        o.expressNo || '',     // 物流单号
        o.expressCompany || '', // 物流公司
        '',                    // 卖家备注
        '',                    // 发票种类
        '',                    // 发票类型
        '',                    // 发票抬头
        '',                    // 纳税人识别号
        '',                    // 开户行
        '',                    // 账号
        '',                    // 地址
        '',                    // 电话
        '1',                   // 是否手机订单（小程序下单）
        '0',                   // 是否货到付款
        payMethod,             // 支付方式
        o.transactionId || '', // 支付交易号
        addr.receiverName || '', // 真实姓名
        '',                    // 身份证号
        '',                    // 仓库名称
        '',                    // 预计发货时间
        '',                    // 预计送达时间
        orderType,             // 订单类型
        o.distribution && o.distribution.referrerId ? '是' : '否', // 是否分销商订单
        ''                     // 业务员
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    
    const csv = [headers.join(','), ...rows].join('\n')
    const filename = `orders_${Date.now()}.csv`
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send('\uFEFF' + csv) // BOM for Excel
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 导入快递单号（回填）
router.post('/orders/import', express.json(), async (req, res) => {
  try {
    const { orders } = req.body // [{orderNo, expressCompany, expressNo}]
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.json({ code: 400, message: '请上传有效数据' })
    }

    const results = { success: 0, failed: 0, errors: [] }
    for (const item of orders) {
      if (!item.orderNo || !item.expressNo) {
        results.failed++
        results.errors.push(`订单号为空或快递单号为空`)
        continue
      }
      const order = await Order.findOne({ orderNo: item.orderNo })
      if (!order) {
        results.failed++
        results.errors.push(`未找到订单: ${item.orderNo}`)
        continue
      }
      order.expressCompany = item.expressCompany || ''
      order.expressNo = item.expressNo
      if (order.status === 'paid') {
        order.status = 'processing'
        order.shippedAt = new Date()
      }
      await order.save()
      results.success++
    }
    res.json({ code: 200, message: `导入完成，成功${results.success}条，失败${results.failed}条`, data: results })
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

// 冻结/解冻用户
router.post('/user/freeze', async (req, res) => {
  try {
    const { userId, freeze } = req.body
    if (!userId) {
      return res.json({ code: 400, message: '缺少用户ID' })
    }
    const result = await AdminService.freezeUser(userId, freeze)
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    res.json({ code: 200, message: result.message })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 手动触发平台月度分红
router.get('/dividend-trigger', adminAuth, async (req, res) => {
  try {
    const { year, month } = req.query
    const now = new Date()
    const targetYear = parseInt(year) || now.getFullYear()
    const targetMonth = parseInt(month) || (now.getMonth() + 1)
    
    const result = await DistributionService.calculateDividend(targetMonth, targetYear)
    res.json({
      code: 200,
      data: result
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router

