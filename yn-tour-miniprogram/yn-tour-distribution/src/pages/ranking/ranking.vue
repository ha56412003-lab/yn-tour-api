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
      <text class="col-earnings">可提现</text>
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

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { getTeamRanking } from '../../api/user'

const userStore = useUserStore()
const timeType = ref('all')
const scrollTop = ref(0)
const rankingList = ref([])
const loading = ref(false)

onLoad((options) => {
  if (options.type) {
    timeType.value = options.type
  }
  loadRanking()
})

async function loadRanking() {
  loading.value = true
  try {
    const res = await getTeamRanking({ limit: 50, period: timeType.value })
    if (res.code === 200 && res.data) {
      rankingList.value = res.data.map((item, index) => ({
        id: item._id || index,
        name: item.nickname || '用户' + String(index + 1),
        avatar: item.avatar || '/static/avatar.png',
        self: item.selfOrderNum || 0,
        direct: item.directPushNum || 0,
        team: item.totalTeamOrders || 0,
        group: item.groupNum || 0,
        // 当月/上月显示periodEarnings，累计显示totalEarnings（预计可提现）
        earnings: item.periodEarnings || item.totalEarnings || 0
      }))
    }
  } catch (e) {
    console.error('加载排行榜失败', e)
  } finally {
    loading.value = false
  }
}

const fullList = computed(() => {
  return rankingList.value
})

function switchTime(type) {
  timeType.value = type
  scrollTop.value = scrollTop.value === 0 ? 0.1 : 0
  loadRanking() // 重新加载对应时间段数据
}

function goBack() {
  uni.navigateBack()
}

function formatName(name) {
  if (!name || name.length < 2) return name || '***'
  return '*'.repeat(name.length - 1) + name[name.length - 1]
}

function formatMoney(money) {
  if (!money && money !== 0) return '0'
  const num = parseFloat(money)
  if (isNaN(num)) return '0'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
