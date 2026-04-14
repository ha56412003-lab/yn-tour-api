// 管理后台服务 - 数据统计和管理功能
const User = require('../models/User')
const Order = require('../models/Order')
const Withdraw = require('../models/Withdraw')
const Commission = require('../models/Commission')
const PlatformStats = require('../models/PlatformStats')

class AdminService {
  /**
   * 获取管理后台数据看板
   */
  static async getDashboardStats() {
    try {
      // 用户统计
      const totalUsers = await User.countDocuments()
      const newUsersToday = await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
      const totalDistributors = await User.countDocuments({ isDistributor: true })

      // 订单统计
      const totalOrders = await Order.countDocuments()
      const paidOrders = await Order.countDocuments({ status: 'paid' })
      const newOrdersToday = await Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })

      // 营收统计
      const paidOrdersList = await Order.find({ status: 'paid' })
      const totalRevenue = paidOrdersList.reduce((sum, order) => sum + order.totalAmount, 0)
      
      const todayPaidOrders = await Order.find({
        status: 'paid',
        paidAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
      const todayRevenue = todayPaidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

      // 佣金统计
      const totalCommission = await Commission.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      const settledCommission = await Commission.aggregate([
        { $match: { status: 'settled' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])

      // 提现统计
      const totalWithdraws = await Withdraw.countDocuments()
      const completedWithdraws = await Withdraw.countDocuments({ status: 'completed' })
      const totalWithdrawAmount = await Withdraw.aggregate([
        { $group: { _id: null, total: { $sum: '$actualAmount' } } }
      ])

      // 待审核提现
      const pendingWithdraws = await Withdraw.countDocuments({ status: 'pending' })

      return {
        success: true,
        data: {
          userStats: {
            totalUsers,
            newUsersToday,
            totalDistributors
          },
          orderStats: {
            totalOrders,
            paidOrders,
            newOrdersToday
          },
          revenueStats: {
            totalRevenue,
            todayRevenue
          },
          commissionStats: {
            totalCommission: totalCommission[0]?.total || 0,
            settledCommission: settledCommission[0]?.total || 0
          },
          withdrawStats: {
            totalWithdraws,
            completedWithdraws,
            totalWithdrawAmount: totalWithdrawAmount[0]?.total || 0,
            pendingWithdraws
          }
        }
      }
    } catch (error) {
      console.error('[管理后台] 获取看板数据失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 获取用户列表（管理后台）
   */
  static async getUserList(page = 1, limit = 20, keyword = '') {
    try {
      const query = {}
      if (keyword) {
        query.$or = [
          { nickname: { $regex: keyword, $options: 'i' } },
          { phone: { $regex: keyword, $options: 'i' } }
        ]
      }

      const list = await User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))

      const total = await User.countDocuments(query)

      return {
        success: true,
        data: {
          list,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      }
    } catch (error) {
      console.error('[管理后台] 获取用户列表失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 获取订单列表（管理后台）
   */
  static async getOrderList(page = 1, limit = 20, status = 'all', keyword = '') {
    try {
      const query = {}
      if (status && status !== 'all') {
        query.status = status
      }
      if (keyword) {
        query.$or = [
          { orderNo: { $regex: keyword, $options: 'i' } },
          { productName: { $regex: keyword, $options: 'i' } }
        ]
      }

      const list = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('userId', 'nickname avatar phone')

      const total = await Order.countDocuments(query)

      return {
        success: true,
        data: {
          list,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      }
    } catch (error) {
      console.error('[管理后台] 获取订单列表失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 获取营收统计（按日期）
   */
  static async getRevenueStats(startDate, endDate) {
    try {
      const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30))
      const end = endDate ? new Date(endDate) : new Date()

      const orders = await Order.find({
        status: 'paid',
        paidAt: {
          $gte: start,
          $lte: end
        }
      }).sort({ paidAt: 1 })

      // 按天统计
      const dailyStats = {}
      orders.forEach(order => {
        const dateKey = new Date(order.paidAt).toISOString().split('T')[0]
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = {
            date: dateKey,
            orders: 0,
            revenue: 0
          }
        }
        dailyStats[dateKey].orders++
        dailyStats[dateKey].revenue += order.totalAmount
      })

      const statsList = Object.values(dailyStats)
      
      const totalRevenue = statsList.reduce((sum, stat) => sum + stat.revenue, 0)
      const totalOrders = statsList.reduce((sum, stat) => sum + stat.orders, 0)

      return {
        success: true,
        data: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          totalRevenue,
          totalOrders,
          dailyStats: statsList
        }
      }
    } catch (error) {
      console.error('[管理后台] 获取营收统计失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 更新或创建每日平台统计
   */
  static async updateDailyStats(date = new Date()) {
    try {
      const today = new Date(date)
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // 用户统计
      const totalUsers = await User.countDocuments()
      const newUsers = await User.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      })
      const distributors = await User.countDocuments({ isDistributor: true })

      // 订单统计
      const totalOrders = await Order.countDocuments()
      const newOrders = await Order.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      })
      const paidOrders = await Order.countDocuments({ status: 'paid' })
      
      const allPaidOrders = await Order.find({ status: 'paid' })
      const totalAmount = allPaidOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      
      const todayPaidOrders = await Order.find({
        status: 'paid',
        paidAt: { $gte: today, $lt: tomorrow }
      })
      const paidAmount = todayPaidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

      // 佣金统计
      const commissions = await Commission.find({
        createdAt: { $gte: today, $lt: tomorrow }
      })
      const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0)
      
      const settledCommissions = commissions.filter(c => c.status === 'settled')
      const settledCommission = settledCommissions.reduce((sum, c) => sum + c.amount, 0)

      // 更新或创建统计记录
      const stats = await PlatformStats.findOneAndUpdate(
        { date: today },
        {
          date: today,
          userStats: {
            totalUsers,
            newUsers,
            activeUsers: newUsers, // 简化，用新增用户数作为活跃用户
            distributors
          },
          orderStats: {
            totalOrders,
            newOrders,
            paidOrders,
            totalAmount,
            paidAmount
          },
          distributionStats: {
            totalCommission,
            settledCommission,
            groupBonus: 0, // 简化
            dividend: 0,
            visitAward: 0
          },
          platformTotalRevenue: totalAmount,
          platformQualifiedTotalOrder: paidOrders,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      )

      console.log(`[平台统计] ${today.toISOString().split('T')[0]} 统计已更新`)

      return { success: true, data: stats }
    } catch (error) {
      console.error('[平台统计] 更新失败:', error)
      return { success: false, message: error.message }
    }
  }
}

module.exports = AdminService

