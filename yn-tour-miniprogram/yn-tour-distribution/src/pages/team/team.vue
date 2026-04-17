<template>
  <view class="team">
    <view class="team-header">
      <view class="team-title">🏆 团队排行榜</view>
      <view class="team-subtitle">实时更新 · 收益透明</view>
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
        有史以来
      </view>
    </view>

    <!-- 我的排名 -->
    <view class="my-rank-card">
      <view class="my-rank-left">
        <image class="my-avatar" src="/static/avatar.png"></image>
        <view class="my-info">
          <text class="my-name">我</text>
          <text class="my-team">团队{{ myTeamSize }}人</text>
        </view>
      </view>
      <view class="my-rank-right">
        <view class="my-rank-num">第{{ myRank }}名</view>
        <view class="my-stats">
          <view class="stat-item">
            <text class="stat-label">自购</text>
            <text class="stat-value">{{ myStats.self }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">直推</text>
            <text class="stat-value">{{ myStats.direct }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">团队</text>
            <text class="stat-value">{{ myStats.team }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">成团</text>
            <text class="stat-value">{{ myStats.group }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Top 10 固定高度无滚动 -->
    <view class="rank-section">
      <view class="section-header">
        <text class="section-title">🏅 排行榜</text>
      </view>
      
      <view class="top10-container">
        <!-- 1-3名 -->
        <view class="top3">
          <view class="top-item second" v-if="topList[1]">
            <view class="rank-icon">🥈</view>
            <image class="top-avatar" :src="topList[1].avatar || '/static/avatar.png'"></image>
            <text class="top-name">{{ desensitizeName(topList[1].name, 1) }}</text>
            <view class="top-stats">
              <text>自购{{ topList[1].self }}</text>
              <text>直推{{ topList[1].direct }}</text>
              <text>团队{{ topList[1].team }}</text>
            </view>
          </view>
          <view class="top-item first" v-if="topList[0]">
            <view class="rank-icon">🥇</view>
            <image class="top-avatar" :src="topList[0].avatar || '/static/avatar.png'"></image>
            <text class="top-name">{{ desensitizeName(topList[0].name, 0) }}</text>
            <view class="top-stats">
              <text>自购{{ topList[0].self }}</text>
              <text>直推{{ topList[0].direct }}</text>
              <text>团队{{ topList[0].team }}</text>
            </view>
          </view>
          <view class="top-item third" v-if="topList[2]">
            <view class="rank-icon">🥉</view>
            <image class="top-avatar" :src="topList[2].avatar || '/static/avatar.png'"></image>
            <text class="top-name">{{ desensitizeName(topList[2].name, 2) }}</text>
            <view class="top-stats">
              <text>自购{{ topList[2].self }}</text>
              <text>直推{{ topList[2].direct }}</text>
              <text>团队{{ topList[2].team }}</text>
            </view>
          </view>
        </view>

        <!-- 4-10名 -->
        <view class="rank-list-mini">
          <view 
            class="rank-item" 
            v-for="(item, index) in topList.slice(3, 10)" 
            :key="item.id"
          >
            <view class="rank-num">{{ index + 4 }}</view>
            <image class="rank-avatar" :src="item.avatar || '/static/avatar.png'"></image>
            <text class="rank-name">{{ desensitizeName(item.name, index + 3) }}</text>
            <view class="rank-stats">
              <text>自购{{ item.self }}</text>
              <text>直推{{ item.direct }}</text>
              <text>团队{{ item.team }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 更多按钮 -->
      <view class="more-btn" @click="goToRanking">
        <text>查看更多</text>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { getMyTeam, getTeamRanking } from '../../api/user'

const userStore = useUserStore()
const timeType = ref('all')

const myRank = ref(0)
const myTeamSize = ref(0)
const myStats = ref({ self: 0, direct: 0, team: 0, group: 0 })
const topList = ref([])
const loading = ref(false)

// 姓名脱敏
const desensitizeName = (name, index) => {
  if (!name) return '***'
  if (index < 10 && name.length >= 2) {
    return name[0] + '*' + name[name.length - 1]
  }
  return name
}

onShow(() => {
  if (userStore.state.isLoggedIn) {
    loadTeamData()
  }
})

async function loadTeamData() {
  loading.value = true
  try {
    const userId = userStore.state.userId
    if (!userId) return

    // 并行请求我的团队数据 + 排行榜
    const [teamRes, rankingRes] = await Promise.all([
      getMyTeam({ userId }),
      getTeamRanking({ limit: 10 })
    ])

    // 填充我的数据
    if (teamRes.code === 200 && teamRes.data) {
      const d = teamRes.data
      myTeamSize.value = d.teamStats?.totalMembers || 0
      myStats.value = {
        self: d.myStats?.selfOrderNum || 0,
        direct: d.myStats?.totalDirectPushNum || 0,
        team: d.myStats?.totalTeamOrders || 0,
        group: d.myStats?.groupNum || 0,
      }
    }

    // 填充排行榜
    if (rankingRes.code === 200 && rankingRes.data) {
      topList.value = rankingRes.data.map((item, index) => ({
        id: item._id || index,
        name: item.nickname || '用户' + String(index + 1),
        self: item.selfOrderNum || 0,
        direct: item.directPushNum || 0,
        team: item.totalTeamOrders || 0,
        group: item.groupNum || 0,
        avatar: item.avatar || '',
        totalEarnings: item.totalEarnings || 0
      }))

      // 计算我的排名
      const myIndex = topList.value.findIndex(item => item.id === userId)
      myRank.value = myIndex >= 0 ? myIndex + 1 : 0
    }
  } catch (e) {
    console.error('加载团队数据失败', e)
  } finally {
    loading.value = false
  }
}

const switchTime = (type) => {
  timeType.value = type
}

const goToRanking = () => {
  uni.navigateTo({
    url: `/pages/ranking/ranking?type=${timeType.value}`
  })
}
</script>

<style scoped>
.team {
  min-height: 100vh;
  background: #f5f7fa;
}

.team-header {
  background: linear-gradient(135deg, #ff8c00, #ff6600);
  padding: 60rpx 30rpx 40rpx;
  text-align: center;
}

.team-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.team-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 10rpx;
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

.my-rank-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.my-rank-left {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.my-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
}

.my-info {
  margin-left: 20rpx;
}

.my-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}

.my-team {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
}

.my-rank-right {
  
}

.my-rank-num {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 16rpx;
}

.my-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 20rpx;
  color: rgba(255,255,255,0.7);
}

.stat-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}

.rank-section {
  background: #fff;
  margin: 20rpx 30rpx 40rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.top10-container {
  /* 固定高度无滚动 */
}

.top3 {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 20rpx 0;
}

.top-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.first { order: 2; transform: translateY(-20rpx); }
.second { order: 1; }
.third { order: 3; }

.rank-icon { margin-bottom: 8rpx; }
.first .rank-icon { font-size: 56rpx; }
.second .rank-icon, .third .rank-icon { font-size: 40rpx; }

.top-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin: 10rpx 0;
}

.first .top-avatar {
  width: 110rpx;
  height: 110rpx;
  border: 6rpx solid #ffd700;
}

.second .top-avatar { border: 4rpx solid #c0c0c0; }
.third .top-avatar { border: 4rpx solid #cd7f32; }

.top-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.top-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8rpx;
}

.top-stats text {
  font-size: 18rpx;
  color: #888;
}

.rank-list-mini {
  margin-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 10rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.rank-item:last-child { border-bottom: none; }

.rank-num {
  width: 50rpx;
  font-size: 26rpx;
  color: #666;
  text-align: center;
}

.rank-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  margin: 0 16rpx;
}

.rank-name {
  flex: 1;
  font-size: 24rpx;
  color: #333;
}

.rank-stats {
  display: flex;
  gap: 16rpx;
}

.rank-stats text {
  font-size: 18rpx;
  color: #888;
}

.more-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.more-btn .arrow {
  font-size: 32rpx;
  margin-left: 8rpx;
}
</style>
