<template>
  <view class="commission-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">💰 佣金明细</text>
    </view>

    <!-- 收益概览 -->
    <view class="earnings-summary">
      <view class="summary-item">
        <text class="summary-value">¥{{ earningsStats.pending }}</text>
        <text class="summary-label">待结算</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-value">¥{{ earningsStats.settled }}</text>
        <text class="summary-label">已结算</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-value">¥{{ earningsStats.total }}</text>
        <text class="summary-label">累计收益</text>
      </view>
    </view>

    <!-- tabs -->
    <view class="tabs">
      <view
        v-for="(tab, idx) in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view class="list-scroll" scroll-y @scrolltolower="loadMore">
      <view class="commission-item" v-for="item in filteredList" :key="item._id">
        <view class="item-left">
          <view class="item-type">
            <text class="type-badge" :class="item.type">{{ getTypeText(item.type) }}</text>
            <text class="item-desc">{{ item.description || '-' }}</text>
          </view>
          <text class="item-time">{{ formatTime(item.createdAt) }}</text>
        </view>
        <view class="item-right">
          <text class="item-amount" :class="item.amount >= 0 ? 'positive' : 'negative'">
            {{ item.amount >= 0 ? '+' : '' }}{{ item.amount.toFixed(2) }}
          </text>
          <text class="item-status" :class="item.status">{{ getStatusText(item.status) }}</text>
        </view>
      </view>

      <view class="empty" v-if="!loading && filteredList.length === 0">
        <text class="empty-text">暂无佣金记录</text>
      </view>

      <view class="loading-more" v-if="loading">
        <text>加载中...</text>
      </view>

      <view class="no-more" v-if="!loading && noMore && filteredList.length > 0">
        <text>— 没有更多了 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { getCommissionList } from '../../api/user'

const userStore = useUserStore()

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待结算', value: 'pending' },
  { label: '已结算', value: 'settled' },
  { label: '冻结', value: 'frozen' }
]

const currentTab = ref('all')
const commissionList = ref([])
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const limit = 20

const earningsStats = computed(() => {
  let pending = 0
  let settled = 0
  let total = 0
  commissionList.value.forEach(item => {
    total += item.amount
    if (item.status === 'pending') pending += item.amount
    if (item.status === 'settled') settled += item.amount
  })
  return {
    pending: pending.toFixed(2),
    settled: settled.toFixed(2),
    total: total.toFixed(2)
  }
})

const filteredList = computed(() => {
  if (currentTab.value === 'all') return commissionList.value
  return commissionList.value.filter(item => item.status === currentTab.value)
})

onShow(() => {
  if (userStore.state.isLoggedIn) {
    resetAndLoad()
  }
})

async function resetAndLoad() {
  commissionList.value = []
  page.value = 1
  noMore.value = false
  await loadCommission()
}

async function loadCommission() {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const userId = userStore.state.userId
    if (!userId) return
    const res = await getCommissionList({ userId, page: page.value, limit })
    if (res.code === 200 && res.data) {
      const list = res.data.list || []
      if (page.value === 1) {
        commissionList.value = list
      } else {
        commissionList.value.push(...list)
      }
      noMore.value = list.length < limit
      page.value++
    }
  } catch (e) {
    console.error('加载佣金明细失败', e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!noMore.value) {
    loadCommission()
  }
}

function switchTab(tab) {
  currentTab.value = tab
}

function goBack() {
  uni.navigateBack()
}

function getTypeText(type) {
  const map = { direct: '直推', indirect: '间推', signIn: '签到', bonus: '奖励' }
  return map[type] || type
}

function getStatusText(status) {
  const map = { pending: '待结算', settled: '已结算', frozen: '冻结' }
  return map[status] || status
}

function formatTime(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.commission-page {
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
}

.page-title {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.earnings-summary {
  background: linear-gradient(135deg, #ff8c00, #ff6600);
  margin: 0 24rpx;
  margin-top: -20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: #fff;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.summary-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.summary-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 6rpx;
}

.summary-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255,255,255,0.4);
}

.tabs {
  display: flex;
  background: #fff;
  margin: 20rpx 24rpx;
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
  background: #ff6600;
  color: #fff;
  font-weight: bold;
}

.list-scroll {
  height: calc(100vh - 400rpx);
  padding: 0 24rpx;
}

.commission-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.type-badge {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-weight: bold;
}

.type-badge.direct { background: #fff7e6; color: #ff6600; }
.type-badge.indirect { background: #e6f7ff; color: #1890ff; }
.type-badge.signIn { background: #e6fff7; color: #52c41a; }
.type-badge.bonus { background: #f9e6ff; color: #722ed1; }

.item-desc {
  font-size: 26rpx;
  color: #333;
  margin-top: 6rpx;
}

.item-time {
  font-size: 22rpx;
  color: #999;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6rpx;
}

.item-amount {
  font-size: 32rpx;
  font-weight: bold;
}

.item-amount.positive { color: #ff6600; }
.item-amount.negative { color: #999; }

.item-status {
  font-size: 22rpx;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
}

.item-status.pending { background: #fff7e6; color: #faad14; }
.item-status.settled { background: #e6fff7; color: #52c41a; }
.item-status.frozen { background: #fff1f0; color: #f5222d; }

.empty {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading-more, .no-more {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
