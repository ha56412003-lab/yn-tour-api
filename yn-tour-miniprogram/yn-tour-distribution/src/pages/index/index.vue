<template>
  <view class="container">
    <!-- 第一屏：核心商品 + 分销入口 -->
    <view class="section1">
      <!-- 核心商品图 -->
      <view class="hero-product" @click="goToProduct">
        <image class="product-img" src="/static/product-bg.png" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">云南6天5晚 · 轻奢游</text>
          <text class="product-price">¥799起</text>
        </view>
      </view>
      
      <!-- 分销按钮区 -->
      <view class="distribute-btns">
        <view class="distribute-btn primary" @click="goToRegister">
          <text class="btn-icon">💰</text>
          <text class="btn-text">加入团游，分佣赚钱</text>
        </view>
        <view class="distribute-btn secondary" @click="goToShareTask">
          <text class="btn-icon">📢</text>
          <text class="btn-text">每日分享赚20元</text>
        </view>
      </view>
    </view>

    <!-- 第二屏：CPS渠道按钮区 -->
    <view class="section2">
      <view class="section-title">
        <text class="title-text">CPS渠道 · 下单返60%佣金</text>
      </view>
      <view class="cps-grid">
        <view class="cps-item" @click="goToCPS('hotel')">
          <text class="cps-icon">🏨</text>
          <text class="cps-name">酒店民宿</text>
          <text class="cps-commission">返60%</text>
        </view>
        <view class="cps-item" @click="goToCPS('ticket')">
          <text class="cps-icon">🎫</text>
          <text class="cps-name">景点门票</text>
          <text class="cps-commission">返50%</text>
        </view>
        <view class="cps-item" @click="goToCPS('food')">
          <text class="cps-icon">🍜</text>
          <text class="cps-name">美食餐饮</text>
          <text class="cps-commission">返45%</text>
        </view>
        <view class="cps-item" @click="goToCPS('ride')">
          <text class="cps-icon">🚗</text>
          <text class="cps-name">出行打车</text>
          <text class="cps-commission">返40%</text>
        </view>
      </view>
    </view>

    <!-- 第三屏：团队排行榜 -->
    <view class="section3">
      <view class="section-title">
        <text class="title-text">🏆 团队排行榜</text>
      </view>
      <view class="rank-list">
        <view class="rank-item" v-for="(item, index) in rankList" :key="index">
          <view class="rank-num" :class="{ 'top3': index < 3 }">{{ index + 1 }}</view>
          <image class="rank-avatar" :src="item.avatar || '/static/avatar.png'" />
          <view class="rank-info">
            <text class="rank-name">{{ item.name }}</text>
            <text class="rank-team">团队{{ item.teamSize }}人</text>
          </view>
          <view class="rank-earnings">
            <text class="earnings-label">赚取</text>
            <text class="earnings-amount">¥{{ item.earnings }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 模拟团队排行榜数据
const rankList = ref([
  { name: '张三', teamSize: 128, earnings: '12,850', avatar: '' },
  { name: '李四', teamSize: 95, earnings: '9,620', avatar: '' },
  { name: '王五', teamSize: 87, earnings: '8,450', avatar: '' },
  { name: '赵六', teamSize: 76, earnings: '7,200', avatar: '' },
  { name: '钱七', teamSize: 64, earnings: '5,980', avatar: '' },
])

// 跳转函数
const goToProduct = () => {
  uni.navigateTo({ url: '/pages/product/product' })
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/distribute/register' })
}

const goToShareTask = () => {
  uni.navigateTo({ url: '/pages/distribute/shareTask' })
}

const goToCPS = (type: string) => {
  uni.navigateTo({ url: `/pages/cps/${type}` })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 第一屏 */
.section1 {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 30rpx;
  padding-bottom: 50rpx;
}

.hero-product {
  border-radius: 24rpx;
  overflow: hidden;
  position: relative;
  height: 400rpx;
  margin-bottom: 30rpx;
}

.product-img {
  width: 100%;
  height: 100%;
}

.product-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 30rpx;
}

.product-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.product-price {
  font-size: 32rpx;
  color: #ffd700;
  font-weight: bold;
}

.distribute-btns {
  display: flex;
  gap: 20rpx;
}

.distribute-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.distribute-btn.primary {
  background: linear-gradient(135deg, #ffd700, #ff9500);
  color: #1a1a2e;
}

.distribute-btn.secondary {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1rpx solid rgba(255,255,255,0.3);
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-weight: bold;
}

/* 第二屏 */
.section2 {
  background: #fff;
  margin: 20rpx;
  border-radius: 24rpx;
  padding: 30rpx;
}

.section-title {
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.cps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.cps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 10rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
}

.cps-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.cps-name {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.cps-commission {
  font-size: 22rpx;
  color: #ff6b6b;
  font-weight: bold;
}

/* 第三屏 */
.section3 {
  background: #fff;
  margin: 20rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.rank-num {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  color: #999;
  background: #e0e0e0;
  border-radius: 50%;
  margin-right: 20rpx;
}

.rank-num.top3 {
  background: linear-gradient(135deg, #ffd700, #ff9500);
  color: #fff;
}

.rank-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #ddd;
}

.rank-info {
  flex: 1;
}

.rank-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.rank-team {
  font-size: 24rpx;
  color: #888;
}

.rank-earnings {
  text-align: right;
}

.earnings-label {
  display: block;
  font-size: 22rpx;
  color: #888;
}

.earnings-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff6b6b;
}
</style>
