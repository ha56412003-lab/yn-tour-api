// 分销服务 - 279分销机制核心逻辑
const User = require('../models/User')
const Order = require('../models/Order')
const Commission = require('../models/Commission')
const PlatformStats = require('../models/PlatformStats')
const VisitRecord = require('../models/VisitRecord')
const Product = require('../models/Product')

class DistributionService {
  /**
   * 计算279分销佣金 - 核心逻辑
   */
  static async calculateCommission(orderId) {
    const order = await Order.findById(orderId).populate('userId')
    if (!order || order.status !== 'paid') {
      return { success: false, message: '订单不存在或未支付' }
    }

    const buyer = order.userId // 购买者
    const product = await Product.findById(order.productId)
    
    if (!product) {
      return { success: false, message: '商品不存在' }
    }

    // 1. 处理购买者自己的订单统计
    await this.updateBuyerStats(buyer._id)

    // 2. 检查是否有推荐人，处理分销逻辑
    let referrer = null
    if (buyer.parentId) {
      referrer = await User.findById(buyer.parentId)
    }

    // 如果有锁客关系，优先使用锁客关系
    if (buyer.isLocked && buyer.lockedBy) {
      referrer = await User.findById(buyer.lockedBy)
    }

    if (!referrer || !referrer.isDistributor) {
      console.log(`[分销] 订单 ${order.orderNo} 无有效推荐人，跳过分销计算`)
      
      // 标记订单佣金状态为已冻结（无推荐人则无佣金可冻结）
      await Order.findByIdAndUpdate(orderId, {
        commissionStatus: 'frozen'
      })
      
      return { success: true, message: '无有效推荐人，跳过分销计算' }
    }

    // 3. 计算279直推分润
    const result = await this.calculate279Profit(referrer, order, product, buyer)
    
    // 4. 标记订单佣金状态为冻结（30天后退款保护期后自动解冻）
    await Order.findByIdAndUpdate(orderId, {
      commissionStatus: 'frozen',
      'distribution.referrerId': referrer._id,
      'distribution.directProfit': result.directProfit,
      'distribution.indirectProfit': result.indirectProfit || 0,
      'distribution.groupBonus': result.groupBonus || 0,
      'distribution.groupDividend': result.groupDividend || 0,
      'distribution.referrerOrderIndex': result.orderIndex
    })

    return { success: true, message: '279分销佣金计算完成（冻结状态，30天后退款保护期后解冻）', data: result }
  }

  /**
   * 计算279直推分润
   */
  static async calculate279Profit(referrer, order, product, buyer) {
    const orderAmount = order.totalAmount
    
    // 计算总直推单量（279规则：只按directPushNum计算，不含锁客单）
    const totalDirectPushNum = (referrer.directPushNum || 0) + 1 // +1为推荐人自己的购买单
    const orderIndex = totalDirectPushNum

    // 279规则：第1单30%，第2单70%，循环往复（避免浮点数精度问题）
    const profitPerOrder1 = Number((orderAmount * 0.3).toFixed(2)) // 30%
    const profitPerOrder2 = Number((orderAmount * 0.7).toFixed(2)) // 70%
    
    let directProfit = 0
    if (orderIndex % 2 === 1) {
      // 奇数单：30%
      directProfit = profitPerOrder1
    } else {
      // 偶数单：70%
      directProfit = profitPerOrder2
    }

    // 判断是否是锁客订单
    const isLockedOrder = buyer.isLocked && buyer.lockedBy && buyer.lockedBy.toString() === referrer._id.toString()

    // 更新推荐人的统计数据
    const updateData = {
      totalTeamOrders: (referrer.totalTeamOrders || 0) + 1
    }

    if (isLockedOrder) {
      updateData.lockedUserOrderNum = (referrer.lockedUserOrderNum || 0) + 1
    } else {
      updateData.directPushNum = (referrer.directPushNum || 0) + 1
    }

    await User.findByIdAndUpdate(referrer._id, updateData)

    // 创建直推分润记录（冻结状态，30天后退款保护期后解冻）
    await Commission.create({
      userId: referrer._id,
      orderId: order._id,
      type: 'direct',
      amount: directProfit,
      orderAmount: orderAmount,
      relatedUserId: buyer._id,
      level: 1,
      status: 'frozen',
      frozenAt: new Date(),
      description: `279直推分润 - 第${orderIndex}单 - ${order.orderNo}（退款保护期冻结）`
    })

    // 更新推荐人的收益（佣金进入冻结余额）
    await User.findByIdAndUpdate(referrer._id, {
      $inc: {
        totalEarnings: directProfit,
        frozenBalance: directProfit,
        directOrders: 1
      }
    })

    // 计算间推分润（10%给间推者：推荐人的推荐人）
    let indirectProfit = 0
    const grandParentId = order.distribution?.grandParentId
    if (grandParentId) {
      const grandParent = await User.findById(grandParentId)
      if (grandParent && grandParent.isDistributor) {
        indirectProfit = Number((orderAmount * 0.1).toFixed(2)) // 固定10%

        // 创建间推分润记录（冻结状态）
        await Commission.create({
          userId: grandParentId,
          orderId: order._id,
          type: 'indirect',
          amount: indirectProfit,
          orderAmount: orderAmount,
          relatedUserId: buyer._id,
          level: 2,
          status: 'frozen',
          frozenAt: new Date(),
          description: `间推分润 - ${order.orderNo} - 固定10%（退款保护期冻结）`
        })

        // 更新间推者收益
        await User.findByIdAndUpdate(grandParentId, {
          $inc: {
            totalEarnings: indirectProfit,
            frozenBalance: indirectProfit
          }
        })
      }
    }

    // 检查是否成团，计算成团奖和成团专项分红
    let groupBonus = 0
    let groupDividend = 0
    const groupResult = await this.calculateGroupBonusAndDividend(referrer._id, order)
    if (groupResult) {
      groupBonus = groupResult.bonus || 0
      groupDividend = groupResult.groupDividend || 0
    }

    return {
      orderIndex,
      directProfit,
      indirectProfit,
      groupBonus,
      groupDividend,
      totalProfit: directProfit + indirectProfit + groupBonus + groupDividend
    }
  }

  /**
   * 计算成团奖 + 成团专项分红（279规则：7人成团，800元/团 + 该团总交易额×2%）
   * 成团专项分红：每成1个7人团，额外拿该团总交易额×2%
   * 仅统计 isValid=true 的订单（退款订单不算点位）
   */
  static async calculateGroupBonusAndDividend(userId, triggerOrder) {
    const user = await User.findById(userId)
    if (!user) {
      return null
    }

    // 计算团队总单量（按279规则：selfOrderNum + directPushNum，不含lockedUserOrderNum）
    // 仅统计 isValid=true 的订单
    const validOrders = await Order.countDocuments({
      'distribution.referrerId': userId,
      'distribution.isValid': true,
      status: 'paid'
    })
    const totalTeamOrder = (user.selfOrderNum || 0) + validOrders

    // 计算成团数
    const newGroupNum = Math.floor(totalTeamOrder / 7)
    const oldGroupNum = user.groupNum || 0

    if (newGroupNum <= oldGroupNum) {
      return null // 没有新成团
    }

    const newGroups = newGroupNum - oldGroupNum
    const bonusPerGroup = 800
    const totalBonus = newGroups * bonusPerGroup

    // 计算成团专项分红：该团总交易额×2%
    // 团总交易额 = 7人 × 每人订单金额
    // 校验触发订单金额有效性
    if (!triggerOrder.totalAmount || triggerOrder.totalAmount <= 0) {
      console.error(`[成团分红] 订单 ${triggerOrder.orderNo} 金额异常(${triggerOrder.totalAmount})，跳过`)
      return null
    }
    const groupTotalAmount = triggerOrder.totalAmount * 7
    const groupDividendPerGroup = groupTotalAmount * 0.02 // ≈111.86元/团
    const totalGroupDividend = Number((newGroups * groupDividendPerGroup).toFixed(2))

    // 更新用户成团数
    await User.findByIdAndUpdate(userId, {
      groupNum: newGroupNum
    })

    // 创建成团奖记录（冻结状态）
    await Commission.create({
      userId: userId,
      orderId: triggerOrder._id,
      type: 'bonus',
      amount: totalBonus,
      orderAmount: triggerOrder.totalAmount,
      relatedUserId: triggerOrder.userId,
      status: 'frozen',
      frozenAt: new Date(),
      description: `成团奖 - 第${newGroupNum}团 - ${newGroups}团×800元（退款保护期冻结）`
    })

    // 创建成团专项分红记录（冻结状态）
    if (totalGroupDividend > 0) {
      await Commission.create({
        userId: userId,
        orderId: triggerOrder._id,
        type: 'bonus',
        amount: totalGroupDividend,
        orderAmount: groupTotalAmount,
        relatedUserId: triggerOrder.userId,
        status: 'frozen',
        frozenAt: new Date(),
        description: `成团专项分红 - 第${newGroupNum}团 - ${newGroups}团×2%≈${groupDividendPerGroup.toFixed(2)}元/团（退款保护期冻结）`
      })
    }

    // 更新用户收益（佣金进入冻结余额）
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalEarnings: totalBonus + totalGroupDividend,
        frozenBalance: totalBonus + totalGroupDividend
      }
    })

    console.log(`[成团奖+专项分红] 用户 ${userId} 获得成团奖${totalBonus}元+专项分红${totalGroupDividend}元，累计${newGroupNum}团`)

    return {
      groupNum: newGroupNum,
      bonus: totalBonus,
      groupDividend: totalGroupDividend
    }
  }

  /**
   * 计算分红（平台利润分享）
   * 条件：总直推 ≥ 2单，或成团数 ≥ 1团
   * 奖金池：平台当月总营业额 × 2%
   */
  static async calculateDividend(month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
    // 获取平台当月统计数据
    const stats = await PlatformStats.findOne({
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0)
      }
    })

    if (!stats) {
      console.log('[分红] 无当月平台统计数据')
      return { success: false, message: '无当月平台统计数据' }
    }

    const dividendPool = stats.platformTotalRevenue * 0.02 // 2%作为奖金池
    const platformQualifiedTotalOrder = stats.platformQualifiedTotalOrder

    if (dividendPool <= 0 || platformQualifiedTotalOrder <= 0) {
      return { success: false, message: '无分红资金池或合格订单' }
    }

    // 获取符合分红条件的用户（279规则：直推≥2 或 成团≥1）
    const eligibleUsers = await User.find({
      $or: [
        { directPushNum: { $gte: 2 } },
        { groupNum: { $gte: 1 } }
      ],
      isDistributor: true
    })

    // 计算每个用户的分红
    const results = []
    for (const user of eligibleUsers) {
      const totalTeamOrder = (user.selfOrderNum || 0) + (user.directPushNum || 0)

      if (totalTeamOrder <= 0) continue

      const userDividend = dividendPool * (totalTeamOrder / platformQualifiedTotalOrder)

      // 1. 平台业绩分红
      if (userDividend > 0) {
        await Commission.create({
          userId: user._id,
          type: 'bonus',
          amount: userDividend,
          orderAmount: stats.platformTotalRevenue,
          status: 'settled',
          settledAt: new Date(),
          description: `${year}年${month}月平台业绩分红`
        })
        await User.findByIdAndUpdate(user._id, {
          $inc: { totalEarnings: userDividend, availableBalance: userDividend }
        })
      }

      // 2. 直推管理津贴：直推用户当月所有收益×10%
      const directPushUsers = await User.find({ parentId: user._id })
      if (directPushUsers.length > 0) {
        const directPushUserIds = directPushUsers.map(u => u._id)
        // 查找直推用户当月的所有佣金收入（直推分润+成团奖+间推分润）
        const monthStart = new Date(year, month - 1, 1)
        const monthEnd = new Date(year, month, 0, 23, 59, 59)
        const commissionAgg = await Commission.aggregate([
          {
            $match: {
              userId: { $in: directPushUserIds },
              createdAt: { $gte: monthStart, $lte: monthEnd },
              status: { $in: ['frozen', 'settled'] },
              type: { $in: ['direct', 'indirect', 'bonus'] }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
        const totalDirectPushEarnings = commissionAgg[0]?.total || 0
        const managementAllowance = Number((totalDirectPushEarnings * 0.1).toFixed(2))

        if (managementAllowance > 0) {
          await Commission.create({
            userId: user._id,
            type: 'bonus',
            amount: managementAllowance,
            orderAmount: totalDirectPushEarnings,
            status: 'settled',
            settledAt: new Date(),
            description: `${year}年${month}月直推管理津贴（直推用户收益×10%）`
          })
          await User.findByIdAndUpdate(user._id, {
            $inc: { totalEarnings: managementAllowance, availableBalance: managementAllowance }
          })
        }

        results.push({
          userId: user._id,
          dividend: userDividend,
          managementAllowance
        })
      } else {
        results.push({
          userId: user._id,
          dividend: userDividend
        })
      }
    }

    console.log(`[分红] ${year}年${month}月分红完成，共${results.length}人获得分红，总额${dividendPool}元`)

    return {
      success: true,
      dividendPool,
      userCount: results.length,
      results
    }
  }

  /**
   * 计算有效访问奖
   * 奖励规则：0.5元/次，每日上限20元
   */
  static async calculateValidVisitAward(userId, visitRecord) {
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 检查是否是今日的奖励
    const lastAwardDate = user.lastVisitAwardDate ? new Date(user.lastVisitAwardDate) : null
    if (lastAwardDate && lastAwardDate.toDateString() === today.toDateString()) {
      // 今日已获得过奖励，检查是否超过上限
      if (user.validVisitNum >= 40) { // 20元 / 0.5元 = 40次
        return { success: false, message: '今日访问奖已达上限' }
      }
    } else {
      // 新的一天，重置计数
      user.validVisitNum = 0
      user.lastVisitAwardDate = today
    }

    const awardPerVisit = 0.5
    const dailyMaxAward = 20

    // 计算此次奖励
    const currentAward = awardPerVisit
    const totalAwardToday = (user.validVisitNum * awardPerVisit) + currentAward

    if (totalAwardToday > dailyMaxAward) {
      return { success: false, message: '今日访问奖已达上限' }
    }

    // 更新用户访问数
    user.validVisitNum = (user.validVisitNum || 0) + 1
    await user.save()

    // 创建访问奖记录
    await Commission.create({
      userId: userId,
      orderId: visitRecord._id,
      type: 'bonus',
      amount: currentAward,
      relatedUserId: visitRecord.userId,
      status: 'settled',
      settledAt: new Date(),
      description: `有效访问奖 - 第${user.validVisitNum}次`
    })

    // 更新用户收益
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalEarnings: currentAward,
        availableBalance: currentAward
      }
    })

    return {
      success: true,
      award: currentAward,
      totalAwardToday,
      visitNum: user.validVisitNum
    }
  }

  /**
   * 计算直推分润
   * 直推分润（按279规则）：第1/3/5...单30%（239.7元），第2/4/6...单70%（559.3元）
   */
  static calcDirectProfit(directPushNum, orderAmount = 799) {
    // 避免浮点数精度问题，统一用 toFixed(2)
    const profitPerOrder1 = Number((orderAmount * 0.3).toFixed(2)) // 239.7元
    const profitPerOrder2 = Number((orderAmount * 0.7).toFixed(2)) // 559.3元
    const cycle = Math.floor(directPushNum / 2) // 完整循环次数（每2单为1个循环）
    const remainder = directPushNum % 2 // 剩余单数（0或1）
    return Number(((cycle * (profitPerOrder1 + profitPerOrder2)) + (remainder * profitPerOrder1)).toFixed(2))
  }

  /**
   * 计算成团奖
   * 条件：团队满7单（selfOrderNum + directPushNum >= 7）
   * 奖金：800元/团
   */
  static calcGroupBonus(selfOrderNum, directPushNum) {
    const totalTeamOrder = selfOrderNum + directPushNum
    const groupNum = Math.floor(totalTeamOrder / 7)
    return groupNum * 800
  }

  /**
   * 计算分红
   * 条件：直推>=2 或 成团>=1
   * 分红池：平台总营业额 × 2%
   * 个人分红 = 分红池 × (团队总单量 / 平台合格总单量)
   */
  static calcDividend(selfOrderNum, directPushNum, platformTotalRevenue, platformQualifiedTotalOrder) {
    const totalTeamOrder = selfOrderNum + directPushNum
    const groupNum = Math.floor(totalTeamOrder / 7)
    const hasDividendRight = directPushNum >= 2 || groupNum >= 1
    if (!hasDividendRight) return 0
    const dividendPool = platformTotalRevenue * 0.02
    return dividendPool * (totalTeamOrder / platformQualifiedTotalOrder)
  }

  /**
   * 计算总收益
   * 自购算团队量但不算直推
   */
  static calcTotalProfit(user, platformStats = null) {
    const selfOrderNum = user.selfOrderNum || 1 // 实际自购数量
    const directPushNum = user.directPushNum || 0 // 直推数量（不算自购）
    const directProfit = this.calcDirectProfit(directPushNum)
    const groupBonus = this.calcGroupBonus(selfOrderNum, directPushNum)
    
    // 分红需要平台统计数据
    let dividend = 0
    if (platformStats) {
      dividend = this.calcDividend(
        selfOrderNum,
        directPushNum,
        platformStats.totalRevenue || 0,
        platformStats.qualifiedTotalOrder || 1
      )
    }
    
    return directProfit + groupBonus + dividend
  }

  /**
   * 计算最终可提现金额
   */
  static calcFinalWithdrawAmount(user, platformStats = null) {
    const selfOrderNum = user.selfOrderNum || 1 // 实际自购数量
    const directPushNum = user.directPushNum || 0 // 直推数量

    // 计算直推分润
    const directProfit = this.calcDirectProfit(directPushNum)
    
    // 计算成团奖
    const groupBonus = this.calcGroupBonus(selfOrderNum, directPushNum)

    // 计算分红（需要平台统计数据）
    let dividend = 0
    if (platformStats) {
      dividend = this.calcDividend(
        selfOrderNum,
        directPushNum,
        platformStats.totalRevenue || 0,
        platformStats.qualifiedTotalOrder || 1
      )
    }

    // 总收益
    const totalProfit = directProfit + groupBonus + dividend

    // 提现规则
    if (totalProfit < 100) {
      return {
        totalProfit: Number(totalProfit.toFixed(2)),
        directProfit: Number(directProfit.toFixed(2)),
        groupBonus: Number(groupBonus.toFixed(2)),
        dividend: Number(dividend.toFixed(2)),
        fee: 0,
        finalAmount: 0,
        note: '收益不足100元，暂不可提现'
      }
    }

    // 手续费：1%，最低1元
    let fee = totalProfit * 0.01
    fee = fee < 1 ? 1 : Math.round(fee * 100) / 100
    const finalAmount = Math.round((totalProfit - fee) * 100) / 100

    return {
      totalProfit: Number(totalProfit.toFixed(2)),
      directProfit: Number(directProfit.toFixed(2)),
      groupBonus: Number(groupBonus.toFixed(2)),
      dividend: Number(dividend.toFixed(2)),
      fee: Number(fee.toFixed(2)),
      finalAmount: Number(finalAmount.toFixed(2)),
      note: '可正常提现'
    }
  }

  /**
   * 更新购买者统计
   */
  static async updateBuyerStats(userId) {
    const user = await User.findById(userId)
    if (!user) return

    // 如果是第一次购买，自动成为分销商
    if (!user.isDistributor) {
      user.isDistributor = true
      user.distributorLevel = 1
    }

    // 增加自购单量
    user.selfOrderNum = (user.selfOrderNum || 0) + 1
    user.totalTeamOrders = (user.totalTeamOrders || 0) + 1

    await user.save()
  }

  /**
   * 用户注册时绑定上下级关系
   */
  static async bindParent(userId, parentId) {
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    if (user.parentId || user.isLocked) {
      return { success: false, message: '已有上级或已被锁客' }
    }

    const parent = await User.findById(parentId)
    if (!parent || !parent.isDistributor) {
      return { success: false, message: '上级不存在或非分销商' }
    }

    if (userId.toString() === parentId.toString()) {
      return { success: false, message: '不能绑定自己' }
    }

    user.parentId = parentId
    user.isDistributor = true
    user.distributorLevel = 1
    await user.save()

    await User.findByIdAndUpdate(parentId, {
      $inc: { teamCount: 1 }
    })

    return { success: true, message: '绑定成功' }
  }

  /**
   * 锁客机制 - 用户下单后自动被上级锁客
   */
  static async lockUser(userId, referrerId) {
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    if (user.isLocked) {
      return { success: false, message: '用户已被锁客' }
    }

    user.isLocked = true
    user.lockedBy = referrerId
    user.lockedAt = new Date()
    await user.save()

    return { success: true, message: '锁客成功' }
  }

  /**
   * 成为分销商
   */
  static async becomeDistributor(userId) {
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    if (user.isDistributor) {
      return { success: false, message: '已是分销商' }
    }

    user.isDistributor = true
    user.distributorLevel = 1
    await user.save()

    return { success: true, message: '成为分销商成功' }
  }

  /**
   * 获取用户收益统计
   */
  static async getUserEarnings(userId) {
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    // 获取当月平台统计
    const now = new Date()
    const platformStats = await PlatformStats.findOne({
      date: {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
    })

    // 计算可提现金额
    const withdrawInfo = this.calcFinalWithdrawAmount(user, platformStats)

    return {
      success: true,
      data: {
        totalEarnings: user.totalEarnings,
        availableBalance: user.availableBalance,
        frozenBalance: user.frozenBalance,
        selfOrderNum: user.selfOrderNum || 0,
        directPushNum: user.directPushNum || 0,
        lockedUserOrderNum: user.lockedUserOrderNum || 0,
        totalDirectPushNum: (user.directPushNum || 0) + (user.lockedUserOrderNum || 0),
        teamCount: user.teamCount || 0,
        groupNum: user.groupNum || 0,
        totalTeamOrders: user.totalTeamOrders || 0,
        withdrawInfo
      }
    }
  }

  /**
   * 获取用户团队排行榜
   */
  /**
   * 获取团队排行榜（支持时间筛选）
   * 当月/上月：统计该时间段内的佣金收益（commission记录）
   * 累计：使用 totalEarnings（已有）
   */
  static async getTeamRanking(limit = 10, period = 'all') {
    const now = new Date()
    let startDate, endDate

    if (period === 'month') {
      // 当月
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    } else if (period === 'lastMonth') {
      // 上月
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    }

    if (period === 'all') {
      // 累计：使用 totalEarnings（含保护期冻结佣金，即预计可提现金额）
      const ranking = await User.find({ isDistributor: true })
        .sort({ totalEarnings: -1 })
        .limit(limit)
        .select('nickname avatar totalEarnings selfOrderNum directPushNum teamCount groupNum totalTeamOrders')
      return ranking.map((u, i) => ({ ...u.toObject(), rank: i + 1 }))
    }

    // 当月/上月：聚合该时间段的佣金收益
    const matchStage = {
      userId: { $exists: true },
      status: { $in: ['frozen', 'settled'] },
      createdAt: { $gte: startDate, $lte: endDate }
    }

    const rankingData = await Commission.aggregate([
      { $match: matchStage },
      { $group: { _id: '$userId', periodEarnings: { $sum: '$amount' } } },
      { $sort: { periodEarnings: -1 } },
      { $limit: limit }
    ])

    // 补充用户信息
    const userIds = rankingData.map(r => r._id)
    const users = await User.find({ _id: { $in: userIds } })
      .select('nickname avatar totalEarnings teamCount groupNum totalTeamOrders')

    const userMap = new Map(users.map(u => [u._id.toString(), u]))
    return rankingData.map((r, i) => {
      const user = userMap.get(r._id.toString())
      return {
        rank: i + 1,
        nickname: user?.nickname || '用户',
        avatar: user?.avatar || '',
        totalEarnings: user?.totalEarnings || 0,
        periodEarnings: r.periodEarnings,
        teamCount: user?.teamCount || 0,
        groupNum: user?.groupNum || 0,
        totalTeamOrders: user?.totalTeamOrders || 0
      }
    })
  }

  /**
   * 获取用户的收益明细
   */
  static async getCommissionList(userId, page = 1, limit = 20) {
    const list = await Commission.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('orderId', 'orderNo productName')
    
    const total = await Commission.countDocuments({ userId })
    
    return {
      list,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 检查并自动解冻用户的过期冻结佣金（30天保护期满）
   * 在用户申请提现时调用，确保冻结佣金及时解冻
   */
  static async checkAndReleaseFrozenCommissions(userId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // 查找所有已过30天保护期的冻结佣金记录
    const frozenCommissions = await Commission.find({
      userId,
      status: 'frozen',
      frozenAt: { $lte: thirtyDaysAgo }
    })
    
    if (frozenCommissions.length === 0) {
      return { success: true, message: '无过期冻结佣金', released: 0 }
    }
    
    let releasedCount = 0
    for (const comm of frozenCommissions) {
      // 从冻结余额转入可用余额
      await User.findByIdAndUpdate(comm.userId, {
        $inc: {
          frozenBalance: -comm.amount,
          availableBalance: comm.amount
        }
      })
      
      // 更新佣金记录状态为已结算
      await Commission.findByIdAndUpdate(comm._id, {
        status: 'settled',
        settledAt: new Date()
      })
      
      // 标记对应订单佣金状态为已释放
      await Order.findByIdAndUpdate(comm.orderId, { commissionStatus: 'released' })
      
      releasedCount++
    }
    
    console.log(`[佣金自动解冻] 用户 ${userId} 共有 ${releasedCount} 笔佣金已解冻`)
    return { success: true, message: `已解冻${releasedCount}笔佣金`, released: releasedCount }
  }

  /**
   * 释放冻结佣金（30天退款保护期满后自动调用）
   * 从 frozenBalance 转入 availableBalance
   */
  static async releaseFrozenCommission(orderId) {
    const order = await Order.findById(orderId)
    if (!order || order.commissionStatus !== 'frozen') {
      return { success: false, message: '订单不存在或佣金状态异常' }
    }

    // 查找该订单对应的所有冻结佣金记录
    const frozenCommissions = await Commission.find({ orderId, status: 'frozen' })
    if (frozenCommissions.length === 0) {
      // 无冻结佣金，检查是否已被追回
      const existingComm = await Commission.findOne({ orderId })
      if (existingComm && existingComm.status === 'clawed_back') {
        return { success: false, message: '该订单佣金已全部追回，禁止重复解冻' }
      }
      await Order.findByIdAndUpdate(orderId, { commissionStatus: 'released' })
      return { success: true, message: '无冻结佣金记录' }
    }

    const releaseInfo = []
    for (const comm of frozenCommissions) {
      // 从冻结余额转入可用余额
      await User.findByIdAndUpdate(comm.userId, {
        $inc: {
          frozenBalance: -comm.amount,
          availableBalance: comm.amount
        }
      })

      // 更新佣金记录状态为已结算
      await Commission.findByIdAndUpdate(comm._id, {
        status: 'settled',
        settledAt: new Date()
      })

      releaseInfo.push({ userId: comm.userId, amount: comm.amount })
    }

    // 标记订单佣金状态为已释放
    await Order.findByIdAndUpdate(orderId, { commissionStatus: 'released' })

    console.log(`[佣金解冻] 订单 ${order.orderNo} 佣金已释放：`, releaseInfo)
    return { success: true, message: '佣金已释放到可用余额', data: releaseInfo }
  }

  /**
   * 佣金追回（退款审核通过后调用）
   * 创建负收益记录，从 frozenBalance 或 availableBalance 扣回
   */
  static async clawbackCommission(orderId) {
    const order = await Order.findById(orderId)
    if (!order || order.commissionStatus === 'clawed_back') {
      return { success: false, message: '订单不存在或佣金已追回' }
    }

    // 查找该订单对应的所有冻结/已结算佣金记录
    const commissions = await Commission.find({ 
      orderId, 
      status: { $in: ['frozen', 'settled'] } 
    })

    if (commissions.length === 0) {
      await Order.findByIdAndUpdate(orderId, { commissionStatus: 'clawed_back' })
      return { success: true, message: '无佣金可追回' }
    }

    const clawbackInfo = []
    for (const comm of commissions) {
      // 查找用户
      const user = await User.findById(comm.userId)
      if (!user) continue

      if (comm.status === 'frozen') {
        // 冻结中：从 frozenBalance 和 totalEarnings 扣回
        // 校验冻结余额是否充足
        const frozenBal = user.frozenBalance || 0
        if (frozenBal < comm.amount) {
          console.error(`[佣金追回] 用户 ${comm.userId} 冻结余额不足(${frozenBal})，需追回 ${comm.amount}，差额 ${comm.amount - frozenBal}`)
          // 冻结余额全扣，不足部分记录（实际场景中此情况极少）
          await User.findByIdAndUpdate(comm.userId, {
            $inc: { frozenBalance: -frozenBal, totalEarnings: -comm.amount }
          })
        } else {
          await User.findByIdAndUpdate(comm.userId, {
            $inc: { frozenBalance: -comm.amount, totalEarnings: -comm.amount }
          })
        }
      } else if (comm.status === 'settled') {
        // 已解冻：从 availableBalance 扣回，余额不足则从 frozenBalance 补扣，同时扣 totalEarnings
        const available = user.availableBalance || 0
        let fromAvailable = Math.min(available, comm.amount)
        let fromFrozen = comm.amount - fromAvailable

        // 校验冻结余额是否充足
        const frozenBal = user.frozenBalance || 0
        if (fromFrozen > frozenBal) {
          console.error(`[佣金追回] 用户 ${comm.userId} 冻结余额不足(${frozenBal})，需补扣 ${fromFrozen}，差额 ${fromFrozen - frozenBal}`)
          fromFrozen = frozenBal
        }

        await User.findByIdAndUpdate(comm.userId, {
          $inc: {
            availableBalance: -fromAvailable,
            frozenBalance: -fromFrozen,
            totalEarnings: -comm.amount
          }
        })
      }

      // 更新佣金记录状态为已追回
      await Commission.findByIdAndUpdate(comm._id, {
        status: 'clawed_back',
        clawedBackAt: new Date()
      })

      clawbackInfo.push({ userId: comm.userId, amount: comm.amount })
    }

    // 标记订单佣金状态为已追回
    await Order.findByIdAndUpdate(orderId, { commissionStatus: 'clawed_back' })

    console.log(`[佣金追回] 订单 ${order.orderNo} 佣金已追回：`, clawbackInfo)
    return { success: true, message: '佣金已追回', data: clawbackInfo }
  }
}

module.exports = DistributionService

