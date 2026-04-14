<template>
  <view class="container">
    <!-- 顶部Header -->
    <view class="header">
      <text class="page-title">预约出行</text>
      <text class="page-subtitle">联系您的旅行管家</text>
    </view>

    <!-- 管家卡片 -->
    <view class="butler-card">
      <view class="butler-badge">专属管家</view>
      <image class="butler-avatar" src="/static/butler-avatar.png" />
      <view class="butler-info">
        <text class="butler-name">小哈旅行管家</text>
        <text class="butler-desc">为您提供一对一专属服务</text>
        <view class="butler-stats">
          <view class="stat"><text class="stat-num">5000+</text><text class="stat-label">服务人数</text></view>
          <view class="stat"><text class="stat-num">4.9</text><text class="stat-label">满意度</text></view>
        </view>
      </view>
      <view class="butler-actions">
        <view class="action-btn phone" @click="callButler">
          <text class="btn-icon">📞</text>
          <text class="btn-text">拨打电话</text>
        </view>
        <view class="action-btn wechat" @click="copyWechat">
          <text class="btn-icon">💬</text>
          <text class="btn-text">添加微信</text>
        </view>
      </view>
    </view>

    <!-- 公众号入口 -->
    <view class="official-account" @click="openOfficialAccount">
      <view class="oa-content">
        <view class="oa-icon-wrap"><text class="oa-icon">📣</text></view>
        <view class="oa-info">
          <text class="oa-title">关注公众号</text>
          <text class="oa-desc">了解更多旅行资讯</text>
        </view>
      </view>
      <text class="oa-arrow">›</text>
    </view>

    <!-- 预约表单 -->
    <view class="booking-form">
      <view class="form-header">
        <text class="form-icon">📝</text>
        <text class="form-title">预约信息</text>
      </view>
      
      <view class="form-item">
        <text class="form-label">姓名</text>
        <input class="form-input" v-model="form.name" placeholder="请输入您的姓名" />
      </view>
      
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input class="form-input" v-model="form.phone" type="number" placeholder="请输入手机号" />
      </view>
      
      <view class="form-item">
        <text class="form-label">出行人数</text>
        <picker :range="personCount" @change="onPersonChange">
          <view class="picker">
            {{ form.personCount || '请选择' }}
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">出行日期</text>
        <picker mode="date" :start="startDate" @change="onDateChange">
          <view class="picker">
            {{ form.date || '请选择日期' }}
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea class="form-textarea" v-model="form.remark" placeholder="请输入备注信息" />
      </view>

      <button class="submit-btn" @click="submitBooking">
        <text class="btn-text">提交预约</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const personCount = ['1人', '2人', '3人', '4人', '5人', '6人', '7人', '8人及以上']

const form = ref({ name: '', phone: '', personCount: '', date: '', remark: '' })

const startDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

const onPersonChange = (e: any) => form.value.personCount = personCount[e.detail.value]
const onDateChange = (e: any) => form.value.date = e.detail.value

const callButler = () => uni.makePhoneCall({ phoneNumber: '13800138000' })
const copyWechat = () => {
  uni.setClipboardData({ data: 'haha travel', success: () => uni.showToast({ title: '微信号已复制', icon: 'success' }) })
}
const openOfficialAccount = () => uni.showToast({ title: '请扫码关注公众号', icon: 'none' })
const submitBooking = () => {
  if (!form.value.name || !form.value.phone) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  uni.showToast({ title: '提交成功！', icon: 'success' })
}
</script>

<style scoped>
.container { min-height: 100vh; background: #f0f2f5; }

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50rpx 30rpx 50rpx;
  border-radius: 0 0 50rpx 50rpx;
}
.page-title { display: block; font-size: 40rpx; font-weight: bold; color: #fff; }
.page-subtitle { font-size: 26rpx; color: rgba(255,255,255,0.8); margin-top: 8rpx; }

/* 管家卡片 */
.butler-card {
  background: #fff; margin: -40rpx 30rpx 20rpx; border-radius: 24rpx; padding: 30rpx;
  box-shadow: 0 12rpx 40rpx rgba(102,126,234,0.15); position: relative;
}
.butler-badge {
  position: absolute; top: 20rpx; right: 20rpx; background: linear-gradient(135deg, #ffd700, #ff9500);
  color: #fff; font-size: 20rpx; padding: 6rpx 16rpx; border-radius: 20rpx;
}
.butler-avatar { width: 140rpx; height: 140rpx; border-radius: 50%; background: #eee; margin-bottom: 20rpx; border: 4rpx solid #f0f0f0; }
.butler-info { margin-bottom: 24rpx; }
.butler-name { display: block; font-size: 34rpx; font-weight: bold; color: #333; }
.butler-desc { font-size: 24rpx; color: #888; margin-top: 6rpx; }
.butler-stats { display: flex; gap: 40rpx; margin-top: 16rpx; }
.butler-stats .stat { display: flex; flex-direction: column; }
.stat-num { font-size: 30rpx; font-weight: bold; color: #667eea; }
.stat-label { font-size: 22rpx; color: #999; }

.butler-actions { display: flex; gap: 20rpx; }
.action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10rpx; padding: 24rpx; border-radius: 16rpx; font-size: 26rpx; }
.action-btn.phone { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
.action-btn.wechat { background: linear-gradient(135deg, #07c160, #06ad56); color: #fff; }
.btn-icon { font-size: 32rpx; }

/* 公众号 */
.official-account {
  background: #fff; margin: 20rpx 30rpx; border-radius: 20rpx; padding: 28rpx;
  display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.oa-content { display: flex; align-items: center; gap: 20rpx; }
.oa-icon-wrap { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 16rpx; }
.oa-icon { font-size: 36rpx; }
.oa-title { display: block; font-size: 28rpx; font-weight: bold; color: #333; }
.oa-desc { font-size: 22rpx; color: #999; }
.oa-arrow { font-size: 40rpx; color: #ccc; }

/* 表单 */
.booking-form { background: #fff; margin: 20rpx 30rpx 40rpx; border-radius: 24rpx; padding: 30rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06); }
.form-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 30rpx; padding-bottom: 24rpx; border-bottom: 2rpx solid #f0f0f0; }
.form-icon { font-size: 36rpx; }
.form-title { font-size: 32rpx; font-weight: bold; color: #333; }

.form-item { margin-bottom: 24rpx; }
.form-label { display: block; font-size: 26rpx; color: #666; margin-bottom: 12rpx; }
.form-input, .picker {
  width: 100%; height: 88rpx; background: #f8f9fa; border-radius: 16rpx; padding: 0 24rpx; font-size: 28rpx; border: 1rpx solid #eee;
}
.form-textarea { width: 100%; height: 180rpx; background: #f8f9fa; border-radius: 16rpx; padding: 24rpx; font-size: 28rpx; border: 1rpx solid #eee; }

.submit-btn {
  width: 100%; height: 96rpx; background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; border-radius: 48rpx; font-size: 30rpx; font-weight: bold; margin-top: 30rpx; border: none;
}
.submit-btn .btn-text { font-size: 32rpx; }
</style>
