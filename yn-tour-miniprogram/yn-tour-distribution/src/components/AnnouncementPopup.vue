<template>
  <view v-if="visible" class="announcement-popup" @click="closePopup">
    <view class="popup-mask" @click.stop="closePopup"></view>
    <view class="popup-card" @click.stop>
      <!-- 顶部装饰条 -->
      <view class="card-top-bar"></view>

      <!-- 关闭按钮 -->
      <view class="close-btn" @click="closePopup">
        <text>✕</text>
      </view>

      <!-- 装饰性图标 -->
      <view class="icon-area">
        <text class="icon-emoji">📢</text>
      </view>

      <!-- 标题 -->
      <view class="card-header">
        <view class="title-decoration left"></view>
        <text class="card-title">{{ announcement?.title || '活动公告' }}</text>
        <view class="title-decoration right"></view>
      </view>

      <!-- 内容区域（可滚动） -->
      <scroll-view class="card-body" scroll-y>
        <view class="content-wrapper">
          <text class="card-content">{{ announcement?.content || '' }}</text>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="card-footer">
        <view class="confirm-btn" @click="closePopup">
          <text>我知道了</text>
        </view>
      </view>

      <!-- 底部装饰线 -->
      <view class="card-bottom-decoration">
        <view class="decoration-dots">
          <view class="d-dot"></view>
          <view class="d-dot"></view>
          <view class="d-dot"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPopupAnnouncement } from '@/api/announcement'

interface Announcement {
  _id: string
  title: string
  content: string
  type: string
  status: number
  showStart: string | null
  showEnd: string | null
  bgColor: string
  textColor: string
}

const visible = ref(false)
const announcement = ref<Announcement | null>(null)

async function onLoad() {
  try {
    const res = await getPopupAnnouncement()
    if (res.code === 200 && res.data) {
      const data = res.data as Announcement
      const closedId = uni.getStorageSync('closedAnnouncementId')
      if (closedId === data._id) {
        return
      }
      announcement.value = data
      visible.value = true
    }
  } catch (e) {
    console.error('获取弹窗公告失败', e)
  }
}

function closePopup() {
  visible.value = false
  if (announcement.value?._id) {
    uni.setStorageSync('closedAnnouncementId', announcement.value._id)
  }
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.announcement-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4rpx);
}

/* 卡片主容器 */
.popup-card {
  position: relative;
  width: 640rpx;
  max-height: 80vh;
  background: linear-gradient(180deg, #FFFBF7 0%, #FFFFFF 100%);
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow:
    0 24rpx 80rpx rgba(180, 80, 40, 0.18),
    0 8rpx 32rpx rgba(180, 80, 40, 0.12),
    0 0 0 1rpx rgba(255, 200, 160, 0.25);
}

/* 顶部渐变装饰条 */
.card-top-bar {
  width: 100%;
  height: 6rpx;
  background: linear-gradient(90deg, #FF6B35 0%, #FFB347 50%, #FF6B35 100%);
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 50%;
  z-index: 10;
}
.close-btn text {
  font-size: 24rpx;
  color: #999;
  line-height: 1;
}

/* 图标区域 */
.icon-area {
  display: flex;
  justify-content: center;
  padding-top: 48rpx;
  padding-bottom: 0;
}
.icon-emoji {
  font-size: 64rpx;
  line-height: 1;
}

/* 标题区域 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 48rpx 20rpx;
  gap: 20rpx;
}
.title-decoration {
  width: 48rpx;
  height: 3rpx;
  border-radius: 2rpx;
}
.title-decoration.left {
  background: linear-gradient(90deg, transparent, #FFB347);
}
.title-decoration.right {
  background: linear-gradient(90deg, #FFB347, transparent);
}
.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 4rpx;
}

/* 内容区域（可滚动） */
.card-body {
  flex: 1;
  width: 100%;
  padding: 0 52rpx;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  box-sizing: border-box;
}
.content-wrapper {
  padding: 8rpx 0 16rpx;
}
.card-content {
  font-size: 28rpx;
  line-height: 2;
  color: #555;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
  letter-spacing: 1rpx;
}

/* 底部按钮 */
.card-footer {
  width: 100%;
  padding: 16rpx 52rpx 24rpx;
  display: flex;
  justify-content: center;
}
.confirm-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}
.confirm-btn text {
  font-size: 30rpx;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}

/* 底部装饰 */
.card-bottom-decoration {
  width: 100%;
  padding: 0 0 20rpx;
  display: flex;
  justify-content: center;
}
.decoration-dots {
  display: flex;
  gap: 8rpx;
}
.d-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #FFD4A8;
}
.d-dot:nth-child(2) {
  background: #FFB88C;
}
</style>
