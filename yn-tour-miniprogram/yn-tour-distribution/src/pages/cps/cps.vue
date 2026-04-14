<template>
  <view class="container">
    <!-- 顶部Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">CPS优惠</text>
    </view>

    <!-- 渠道列表 -->
    <view class="channel-list">
      <view class="channel-item" v-for="item in channels" :key="item.id" @click="goToChannel(item)">
        <view class="channel-icon" :style="{ background: item.color }">{{ item.icon }}</view>
        <view class="channel-info">
          <text class="channel-name">{{ item.name }}</text>
          <text class="channel-desc">{{ item.desc }}</text>
        </view>
        <view class="channel-commission">{{ item.commission }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
const goBack = () => uni.navigateBack()

const channels = [
  { id: 1, name: '酒店民宿', icon: '🏨', desc: '订酒店返佣金', commission: '返15%', color: 'linear-gradient(135deg, #ff6b6b, #ff8e53)' },
  { id: 2, name: '加油', icon: '⛽', desc: '加油享优惠', commission: '返5%', color: 'linear-gradient(135deg, #4ecdc4, #44a08d)' },
  { id: 3, name: '美团优惠券', icon: '🍔', desc: '外卖红包', commission: '返10%', color: 'linear-gradient(135deg, #ffd700, #ff9500)' },
  { id: 4, name: '饿了么', icon: '🍜', desc: '外卖红包', commission: '返10%', color: 'linear-gradient(135deg, #ff6b9d, #c75cd8)' },
  { id: 5, name: '电影票', icon: '🎬', desc: '看电影享优惠', commission: '返8%', color: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 6, name: '出行打车', icon: '🚗', desc: '打车享优惠', commission: '返5%', color: 'linear-gradient(135deg, #667eea, #5f27cd)' },
]

const channelMap = {
  1: '/pages/cps/channels/hotel',
  2: '/pages/cps/channels/oil',
  3: '/pages/cps/channels/meituan',
  4: '/pages/cps/channels/elem',
  5: '/pages/cps/channels/movie',
  6: '/pages/cps/channels/taxi',
}

const goToChannel = (item) => {
  const path = channelMap[item.id]
  if (path) {
    uni.navigateTo({ url: path })
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f7fa; }

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50rpx 30rpx 40rpx;
  border-radius: 0 0 40rpx 40rpx;
  display: flex;
  align-items: center;
}
.back-btn { font-size: 48rpx; color: #fff; margin-right: 20rpx; font-weight: bold; }
.page-title { font-size: 40rpx; font-weight: bold; color: #fff; }

/* 渠道列表 */
.channel-list { padding: 30rpx; }
.channel-item {
  display: flex; align-items: center; background: #fff; border-radius: 20rpx;
  padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.channel-icon {
  width: 100rpx; height: 100rpx; display: flex; align-items: center; justify-content: center;
  border-radius: 20rpx; font-size: 48rpx; margin-right: 20rpx; flex-shrink: 0;
}
.channel-info { flex: 1; }
.channel-name { display: block; font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 6rpx; }
.channel-desc { font-size: 24rpx; color: #888; }
.channel-commission {
  font-size: 26rpx; font-weight: bold; color: #ff6b6b; padding: 8rpx 16rpx;
  background: #fff5f5; border-radius: 20rpx;
}
</style>
