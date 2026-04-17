<template>
  <view class="settings-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">⚙️ 设置</text>
    </view>

    <!-- 用户信息 -->
    <view class="section user-section" v-if="isLoggedIn">
      <view class="user-card">
        <image class="avatar" :src="userInfo.avatar || '/static/avatar.png'" mode="aspectFill" />
        <view class="user-detail">
          <text class="nickname">{{ userInfo.nickname || '微信用户' }}</text>
          <text class="user-id">ID: {{ userId }}</text>
        </view>
        <view class="level-tag" :class="userInfo.isDistributor ? 'vip' : 'normal'">
          {{ userInfo.isDistributor ? '分销商' : '普通会员' }}
        </view>
      </view>
    </view>

    <!-- 设置列表 -->
    <view class="section">
      <view class="settings-group">
        <!-- 账户设置 -->
        <view class="group-title">账户</view>
        <view class="setting-item" @click="goToUserInfo">
          <text class="setting-label">个人资料</text>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @click="handleDistributor">
          <text class="setting-label">{{ userInfo.isDistributor ? '分销商信息' : '申请成为分销商' }}</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>

      <view class="settings-group">
        <view class="group-title">通用</view>
        <view class="setting-item" @click="clearCache">
          <text class="setting-label">清理缓存</text>
          <view class="setting-right">
            <text class="setting-value">{{ cacheSize }}</text>
            <text class="setting-arrow">›</text>
          </view>
        </view>
        <view class="setting-item" @click="checkUpdate">
          <text class="setting-label">检查更新</text>
          <view class="setting-right">
            <text class="setting-value">v{{ version }}</text>
            <text class="setting-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="settings-group">
        <view class="group-title">关于</view>
        <view class="setting-item" @click="goToAbout">
          <text class="setting-label">关于我们</text>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @click="showProtocol">
          <text class="setting-label">用户协议</text>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @click="showPrivacy">
          <text class="setting-label">隐私政策</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="isLoggedIn">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 未登录 -->
    <view class="logout-section" v-else>
      <button class="login-btn" @click="goToLogin">登录 / 注册</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const cacheSize = ref('0 B')
const version = ref('1.0.0')

const isLoggedIn = computed(() => userStore.state.isLoggedIn)
const userId = computed(() => userStore.state.userId || '-')
const userInfo = computed(() => ({
  nickname: userStore.state.nickname,
  avatar: userStore.state.avatar,
  isDistributor: userStore.state.isDistributor
}))

function goBack() {
  uni.navigateBack()
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

function goToUserInfo() {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function handleDistributor() {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (userInfo.value.isDistributor) {
    uni.showToast({ title: '分销商信息展示开发中', icon: 'none' })
  } else {
    uni.navigateTo({ url: '/pages/join/join' })
  }
}

function clearCache() {
  uni.showModal({
    title: '清理缓存',
    content: '确定要清理缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        cacheSize.value = '0 B'
        uni.showToast({ title: '清理完成', icon: 'success' })
      }
    }
  })
}

function checkUpdate() {
  uni.showToast({ title: '已是最新版本', icon: 'success' })
}

function goToAbout() {
  uni.showModal({
    title: '哈哈哈哈旅行',
    content: '云南6天5晚旅行分销小程序\n版本: 1.0.0\n\n让旅行更简单，让分享更有价值',
    showCancel: false
  })
}

function showProtocol() {
  uni.showModal({
    title: '用户协议',
    content: '用户协议内容...\n（请根据实际协议内容补充）',
    showCancel: false
  })
}

function showPrivacy() {
  uni.showModal({
    title: '隐私政策',
    content: '隐私政策内容...\n（请根据实际政策内容补充）',
    showCancel: false
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
        uni.navigateBack()
      }
    }
  })
}

// 初始化缓存大小
try {
  const info = uni.getStorageInfoSync()
  cacheSize.value = info.currentSize ? `${info.currentSize} KB` : '0 B'
} catch (e) {}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50rpx 30rpx 40rpx;
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

.section {
  padding: 20rpx 24rpx;
}

.user-section {
  padding: 0 24rpx 20rpx;
}

.user-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  margin-top: -20rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #f0f0f0;
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.user-id {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.level-tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-weight: bold;
}

.level-tag.vip {
  background: linear-gradient(135deg, #ffd700, #ff9500);
  color: #fff;
}

.level-tag.normal {
  background: #f0f0f0;
  color: #999;
}

.settings-group {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.group-title {
  font-size: 24rpx;
  color: #999;
  padding: 20rpx 30rpx 10rpx;
  background: #fafafa;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 30rpx;
  color: #333;
}

.setting-right {
  display: flex;
  align-items: center;
}

.setting-value {
  font-size: 26rpx;
  color: #999;
  margin-right: 10rpx;
}

.setting-arrow {
  font-size: 32rpx;
  color: #ccc;
}

.logout-section {
  padding: 40rpx 24rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #fff;
  color: #f5222d;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: none;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: none;
}
</style>
