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
        <view class="title-decoration"></view>
        <text class="card-title">{{ announcement?.title || '活动公告' }}</text>
        <view class="title-decoration"></view>
      </view>
      
      <!-- 分割线 -->
      <scroll-view class="card-body" scroll-y>
        <text class="card-content">{{ announcement?.content || '' }}</text>
      </scroll-view>
      
      <!-- 底部装饰点 -->
      <view class="card-dots">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot active"></view>
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
  background: rgba(0, 0, 0, 0.65);
}

/* 卡片主容器 */
.popup-card {
  position: relative;
  width: 620rpx;
  max-height: 85vh;
  background: linear-gradient(180deg, #fff9f0 0%, #ffffff 60%);
  border-radius: 32rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 0 20rpx 60rpx rgba(200, 100, 50, 0.25), 0 0 0 1rpx rgba(255, 200, 150, 0.3);
}

/* 顶部渐变装饰条 */
.card-top-bar {
  height: 8rpx;
  background: linear-gradient(90deg, #ff6b35, #f7c948, #ff6b35);
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  z-index: 2;
}
.close-btn text {
  font-size: 28rpx;
  color: #ff6b35;
  line-height: 1;
}

/* 图标区域 */
.icon-area {
  display: flex;
  justify-content: center;
  padding-top: 40rpx;
  padding-bottom: 8rpx;
}
.icon-emoji {
  font-size: 72rpx;
  line-height: 1;
}

/* 标题区域 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 48rpx 0;
  gap: 16rpx;
}
.title-decoration {
  width: 60rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #f7c948, transparent);
  border-radius: 2rpx;
}
.card-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff6b35;
  letter-spacing: 2rpx;
}

/* 分割线 */
.divider {
  display: flex;
  align-items: center;
  padding: 20rpx 48rpx;
  gap: 16rpx;
}
.divider-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
}
.divider-star {
  font-size: 20rpx;
  color: #f7c948;
}

/* 内容区域（可滚动） */
.card-body {
  flex: 1;
  width: 100%;
  padding: 8rpx 48rpx 16rpx;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  box-sizing: border-box;
}
.card-content {
  font-size: 30rpx;
  line-height: 1.9;
  color: #666;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
}

/* 底部装饰点 */
.card-dots {
  display: flex;
  justify-content: center;
  padding-bottom: 24rpx;
  gap: 12rpx;
}
.dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #ffd700;
  opacity: 0.4;
}
.dot.active {
  width: 28rpx;
  border-radius: 6rpx;
  opacity: 1;
  background: linear-gradient(90deg, #ff6b35, #ff8c42);
}
</style>