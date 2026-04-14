<template>
  <view class="ranking-page">
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">🏆 完整排行榜</text>
    </view>

    <!-- 时间筛选 -->
    <view class="time-tabs">
      <view 
        class="tab-item" 
        :class="{ active: timeType === 'month' }" 
        @click="switchTime('month')"
      >
        当月
      </view>
      <view 
        class="tab-item" 
        :class="{ active: timeType === 'lastMonth' }" 
        @click="switchTime('lastMonth')"
      >
        上月
      </view>
      <view 
        class="tab-item" 
        :class="{ active: timeType === 'all' }" 
        @click="switchTime('all')"
      >
        累计
      </view>
    </view>

    <!-- 列表标题 -->
    <view class="list-header">
      <text class="col-rank">排名</text>
      <text class="col-user">用户</text>
      <text class="col-stats">自购/直推/团队/成团</text>
      <text class="col-earnings">提现金额</text>
    </view>

    <!-- 排行榜列表 -->
    <scroll-view 
      class="rank-scroll" 
      scroll-y 
      :scroll-top="scrollTop"
    >
      <view 
        class="rank-item" 
        v-for="(item, index) in fullList" 
        :key="item.id"
      >
        <!-- 排名 -->
        <view class="col-rank">
          <text v-if="index === 0" class="medal">🏆</text>
          <text v-else-if="index === 1" class="medal">🥈</text>
          <text v-else-if="index === 2" class="medal">🥉</text>
          <text v-else class="num">{{ index + 1 }}</text>
        </view>
        
        <!-- 用户信息 -->
        <view class="col-user">
          <image class="avatar" :src="item.avatar || '/static/avatar.png'"></image>
          <text class="name">{{ formatName(item.name) }}</text>
        </view>
        
        <!-- 数据 -->
        <view class="col-stats">
          <text class="stat">{{ item.self }}</text>
          <text class="stat">{{ item.direct }}</text>
          <text class="stat">{{ item.team }}</text>
          <text class="stat">{{ item.group }}</text>
        </view>
        
        <!-- 金额 -->
        <view class="col-earnings">
          <text class="earnings">¥{{ formatMoney(item.earnings) }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      timeType: 'month',
      scrollTop: 0
    }
  },
  onLoad(options) {
    if (options.type) {
      this.timeType = options.type
    }
  },
  computed: {
    fullList() {
      return this.generateData(this.timeType)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    // 279分销佣金计算规则（最新准确版）
    calculateEarnings(self, direct, team, platformRevenue = 1000000, platformOrders = 1000) {
      const selfOrderNum = self || 1
      const directPushNum = direct
      const totalTeamOrder = selfOrderNum + directPushNum
      
      // 1. 直推分润
      const profitPerOrder1 = 239.7   // 第1/3/5...单
      const profitPerOrder2 = 559.3   // 第2/4/6...单
      const cycle = Math.floor(directPushNum / 2)
      const remainder = directPushNum % 2
      const directProfit = cycle * (profitPerOrder1 + profitPerOrder2) + remainder * profitPerOrder1
      
      // 2. 成团奖
      const groupNum = Math.floor(totalTeamOrder / 7)
      const groupBonus = groupNum * 800
      
      // 3. 分红（需直推≥2或成团≥1）
      const hasDividendRight = directPushNum >= 2 || groupNum >= 1
      let dividend = 0
      if (hasDividendRight) {
        const dividendPool = platformRevenue * 0.02
        dividend = dividendPool * (totalTeamOrder / platformOrders)
      }
      
      // 4. 总收益
      const totalProfit = directProfit + groupBonus + dividend
      
      // 5. 手续费
      let fee = 0
      if (totalProfit >= 100) {
        fee = Math.max(1, Math.round(totalProfit * 0.01 * 100) / 100)
      }
      
      // 6. 最终提现金额
      const finalEarning = totalProfit >= 100 ? totalProfit - fee : 0
      
      return Math.floor(finalEarning * 100) / 100
    },
    generateData(type) {
      const names = ['李娜', '张伟', '王芳', '赵强', '刘洋', '陈静', '杨明', '黄磊', '周涛', '吴娟',
        '徐鹏', '孙丽', '马超', '朱艳', '胡杰', '郭静', '何伟', '林涛', '罗娟', '高峰',
        '宋洋', '韩梅', '邓丽', '曹鹏', '彭芳', '卢刚', '田秀', '崔杰', '谢娟', '苏明',
        '蒋涛', '杜娟', '叶刚', '夏丽', '钟杰', '覃芳', '石鹏', '范娟', '汪刚', '毛丽',
        '贺杰', '龙芳', '毕鹏', '邝丽', '景伟', '柴芳', '蒲鹏', '封丽', '窦伟', '蔺芳',
        '桑鹏', '松丽', '寇伟', '荀芳', '羊鹏', '於丽', '储伟', '靳芳', '汲鹏', '邴丽',
        '糜伟', '松芳', '井鹏', '段丽', '富伟', '巫芳', '焦鹏', '巴丽', '弓伟', '牧芳',
        '贺伟', '龙芳', '毕鹏', '邝丽', '景伟', '柴芳', '蒲鹏', '封丽', '窦伟', '蔺芳',
        '桑鹏', '松丽', '寇伟', '荀芳', '羊鹏', '於丽', '储伟', '靳芳', '汲鹏', '邴丽',
        '糜伟', '松芳', '井鹏', '段丽', '富伟', '巫芳', '焦鹏', '巴丽', '弓伟', '牧芳']
      
      const baseData = {
        month: { self: [0,6], direct: [1,15], team: [3,30], group: [1,10] },
        lastMonth: { self: [0,5], direct: [1,12], team: [2,25], group: [1,8] },
        all: { self: [5,50], direct: [10,130], team: [20,300], group: [5,90] }
      }
      
      const ranges = baseData[type] || baseData.month
      
      return names.map((name, i) => {
        const self = Math.floor(Math.random() * (ranges.self[1] - ranges.self[0]) + ranges.self[0])
        const direct = Math.floor(Math.random() * (ranges.direct[1] - ranges.direct[0]) + ranges.direct[0])
        const team = Math.floor(Math.random() * (ranges.team[1] - ranges.team[0]) + ranges.team[0])
        const group = Math.floor(Math.random() * (ranges.group[1] - ranges.group[0]) + ranges.group[0])
        
        return {
          id: i + 1,
          name: name,
          self: self,
          direct: direct,
          team: team,
          group: group,
          earnings: this.calculateEarnings(self, direct, team, group),
          avatar: '/static/avatar.png'
        }
      }).sort((a, b) => {
        // 排序：团队总单量 > 直推单量 > 成团数量
        if (b.team !== a.team) return b.team - a.team
        if (b.direct !== a.direct) return b.direct - a.direct
        return b.group - a.group
      })
    },
    switchTime(type) {
      this.timeType = type
      this.scrollTop = this.scrollTop === 0 ? 0.1 : 0
    },
    // 姓名脱敏：只显示最后一个字
    formatName(name) {
      if (!name || name.length < 2) return name
      const lastChar = name[name.length - 1]
      const asterisk = '*'.repeat(name.length - 1)
      return asterisk + lastChar
    },
    formatMoney(money) {
      return money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }
}
</script>

<style scoped>
.ranking-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #ff8c00, #ff6600);
  padding: 50rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
}

.back-btn {
  font-size: 48rpx;
  color: #fff;
  margin-right: 20rpx;
  font-weight: bold;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.time-tabs {
  display: flex;
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 12rpx;
  padding: 8rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 8rpx;
}

.tab-item.active {
  background: linear-gradient(135deg, #ff8c00, #ff6600);
  color: #fff;
  font-weight: bold;
}

.list-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  font-size: 20rpx;
  color: #999;
  border-bottom: 1rpx solid #eee;
}

.col-rank { width: 80rpx; text-align: center; }
.col-user { flex: 1; }
.col-stats { width: 180rpx; display: flex; justify-content: space-around; }
.col-earnings { width: 140rpx; text-align: right; }

.rank-scroll {
  height: calc(100vh - 300rpx);
  background: #fff;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.col-rank {
  width: 80rpx;
  text-align: center;
}

.medal {
  font-size: 40rpx;
}

.num {
  font-size: 28rpx;
  color: #666;
}

.col-user {
  flex: 1;
  display: flex;
  align-items: center;
}

.avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.name {
  font-size: 26rpx;
  color: #333;
}

.col-stats {
  width: 180rpx;
  display: flex;
  justify-content: space-around;
}

.stat {
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

.col-earnings {
  width: 140rpx;
  text-align: right;
}

.earnings {
  font-size: 24rpx;
  font-weight: bold;
  color: #ff3300;
}
</style>
