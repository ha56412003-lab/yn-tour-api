// 提现服务
const User = require('../models/User')
const Withdraw = require('../models/Withdraw')
const DistributionService = require('./DistributionService')

class WithdrawService {
  /**
   * 用户申请提现
   */
  static async applyWithdraw(userId, withdrawMethod, accountInfo, amount) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        return { success: false, message: '用户不存在' }
      }

      // 检查是否是分销商
      if (!user.isDistributor) {
        return { success: false, message: '只有分销商可以提现' }
      }

      // 计算可提现金额
      const withdrawInfo = DistributionService.calcFinalWithdrawAmount(user)
      const maxWithdrawAmount = withdrawInfo.finalAmount

      if (maxWithdrawAmount <= 0) {
        return { success: false, message: withdrawInfo.note || '无可提现金额' }
      }

      if (amount > maxWithdrawAmount) {
        return { success: false, message: `提现金额超过可提现额度，最多可提现${maxWithdrawAmount}元` }
      }

      // 最低提现金额100元
      if (amount < 100) {
        return { success: false, message: '最低提现金额100元' }
      }

      // 计算手续费
      const fee = Math.max(amount * 0.01, 1)
      const actualAmount = amount - fee

      // 生成提现单号
      const withdrawNo = await Withdraw.generateWithdrawNo()

      // 创建提现记录
      const withdraw = await Withdraw.create({
        withdrawNo,
        userId,
        amount,
        fee,
        actualAmount,
        withdrawMethod,
        accountInfo,
        status: 'pending'
      })

      // 冻结用户余额
      await User.findByIdAndUpdate(userId, {
        $inc: {
          availableBalance: -amount,
          frozenBalance: amount
        }
      })

      console.log(`[提现] 用户 ${userId} 申请提现 ${amount}元，手续费${fee}元，实际到账${actualAmount}元`)

      return {
        success: true,
        message: '提现申请提交成功',
        data: withdraw
      }
    } catch (error) {
      console.error('[提现] 申请失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 审核提现申请
   */
  static async approveWithdraw(withdrawId, approved, rejectReason = '') {
    try {
      const withdraw = await Withdraw.findById(withdrawId)
      if (!withdraw) {
        return { success: false, message: '提现记录不存在' }
      }

      if (withdraw.status !== 'pending') {
        return { success: false, message: '提现申请已处理' }
      }

      const user = await User.findById(withdraw.userId)
      if (!user) {
        return { success: false, message: '用户不存在' }
      }

      if (approved) {
        // 审核通过
        withdraw.status = 'approved'
        withdraw.approvedAt = new Date()
        await withdraw.save()

        console.log(`[提现] 提现申请 ${withdrawId} 审核通过`)

        return {
          success: true,
          message: '审核通过',
          data: withdraw
        }
      } else {
        // 审核拒绝
        withdraw.status = 'rejected'
        withdraw.rejectReason = rejectReason
        await withdraw.save()

        // 解冻用户余额
        await User.findByIdAndUpdate(withdraw.userId, {
          $inc: {
            availableBalance: withdraw.amount,
            frozenBalance: -withdraw.amount
          }
        })

        console.log(`[提现] 提现申请 ${withdrawId} 审核拒绝，原因：${rejectReason}`)

        return {
          success: true,
          message: '审核拒绝，金额已退回',
          data: withdraw
        }
      }
    } catch (error) {
      console.error('[提现] 审核失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 处理提现（打款）
   */
  static async processWithdraw(withdrawId) {
    try {
      const withdraw = await Withdraw.findById(withdrawId)
      if (!withdraw) {
        return { success: false, message: '提现记录不存在' }
      }

      if (withdraw.status !== 'approved') {
        return { success: false, message: '提现申请未审核通过' }
      }

      // 这里应该集成真实的打款接口（微信企业付款、支付宝转账等）
      // 由于是演示，我们先模拟打款流程

      withdraw.status = 'processing'
      withdraw.processedAt = new Date()
      await withdraw.save()

      console.log(`[提现] 开始处理提现 ${withdrawId}，金额 ${withdraw.actualAmount}元`)

      // 模拟打款成功
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 完成提现
      withdraw.status = 'completed'
      withdraw.completedAt = new Date()
      withdraw.transactionId = `mock_transfer_${Date.now()}`
      await withdraw.save()

      // 扣除用户冻结余额
      await User.findByIdAndUpdate(withdraw.userId, {
        $inc: {
          frozenBalance: -withdraw.amount
        }
      })

      console.log(`[提现] 提现 ${withdrawId} 处理完成，实际到账 ${withdraw.actualAmount}元`)

      return {
        success: true,
        message: '提现处理完成',
        data: withdraw
      }
    } catch (error) {
      console.error('[提现] 处理失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 获取用户提现记录
   */
  static async getUserWithdrawList(userId, page = 1, limit = 20, status = 'all') {
    try {
      const query = { userId }
      if (status && status !== 'all') {
        query.status = status
      }

      const list = await Withdraw.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))

      const total = await Withdraw.countDocuments(query)

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
      console.error('[提现] 获取列表失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 获取提现详情
   */
  static async getWithdrawDetail(withdrawId) {
    try {
      const withdraw = await Withdraw.findById(withdrawId).populate('userId', 'nickname avatar')
      if (!withdraw) {
        return { success: false, message: '提现记录不存在' }
      }

      return {
        success: true,
        data: withdraw
      }
    } catch (error) {
      console.error('[提现] 获取详情失败:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * 获取管理后台提现列表（所有用户）
   */
  static async getAdminWithdrawList(page = 1, limit = 20, status = 'all') {
    try {
      const query = {}
      if (status && status !== 'all') {
        query.status = status
      }

      const list = await Withdraw.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('userId', 'nickname avatar phone')

      const total = await Withdraw.countDocuments(query)

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
      console.error('[提现] 获取管理列表失败:', error)
      return { success: false, message: error.message }
    }
  }
}

module.exports = WithdrawService

