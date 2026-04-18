<template>
  <view class="container">
    <view class="header">
      <text class="title">淘宝订单导入</text>
      <text class="subtitle">免购买，加入分销商</text>
    </view>

    <view class="content">
      <view class="info-card">
        <text class="info-title">📋 导入说明</text>
        <view class="info-list">
          <text class="info-item">1. 请确保您有有效的淘宝订单</text>
          <text class="info-item">2. 订单需为旅游相关产品</text>
          <text class="info-item">3. 导入后即可成为分销商</text>
        </view>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="label">订单编号</text>
          <input 
            class="input" 
            v-model="orderNo" 
            placeholder="请输入淘宝订单编号"
            type="text"
          />
        </view>

        <view class="form-item">
          <text class="label">手机号</text>
          <input 
            class="input" 
            v-model="phone" 
            placeholder="请输入注册手机号"
            type="number"
            maxlength="11"
          />
        </view>

        <button class="submit-btn" :loading="loading" @click="handleImport">
          确认导入
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { submitImport } from '@/api/order'

const userStore = useUserStore()
const orderNo = ref('')
const phone = ref('')
const loading = ref(false)

const handleImport = async () => {
  if (!orderNo.value) {
    uni.showToast({ title: '请输入订单编号', icon: 'none' })
    return
  }
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  loading.value = true
  try {
    console.log('[导入] 开始提交, phone:', phone.value, 'orderNo:', orderNo.value, 'userId:', userStore.state.userId)
    const res = await submitImport({
      userId: userStore.state.userId || undefined,
      phone: phone.value,
      nickname: userStore.state.nickname || undefined,
      importOrderNo: orderNo.value,
      importSource: '淘宝'
    })
    console.log('[导入] 响应:', JSON.stringify(res))
    if (res.code === 200) {
      uni.showToast({ title: '提交成功，请等待审核', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' })
    }
  } catch (e) {
    console.error('[导入] 失败:', e)
    uni.showToast({ title: '导入失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  margin-bottom: 30rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
}

.content {
  padding: 20rpx;
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.info-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 20rpx;
}

.info-list {
  padding-left: 10rpx;
}

.info-item {
  display: block;
  font-size: 26rpx;
  color: #555;
  line-height: 1.8;
  margin-bottom: 10rpx;
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 80rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}

.submit-btn::after {
  border: none;
}
</style>
