<template>
  <view class="join-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">申请成为分销商</text>
    </view>

    <!-- 已经是分销商 -->
    <view class="already-distributor" v-if="userInfo.isDistributor">
      <view class="success-icon">✅</view>
      <text class="success-text">您已经是分销商</text>
      <text class="success-sub">可直接享受推广权益</text>
    </view>

    <!-- 申请选项 -->
    <view class="section" v-else>
      <!-- 方式一：购买旅游卡 -->
      <view class="option-card" @click="goToProduct">
        <view class="option-icon">🛒</view>
        <view class="option-content">
          <text class="option-title">方式一：购买旅游卡</text>
          <text class="option-desc">购买799元云南6天5晚旅游卡，直接成为分销商</text>
        </view>
        <text class="option-arrow">›</text>
      </view>

      <!-- 方式二：导入已有订单 -->
      <view class="option-card" @click="showImportForm = !showImportForm">
        <view class="option-icon">📦</view>
        <view class="option-content">
          <text class="option-title">方式二：导入其他平台订单</text>
          <text class="option-desc">已在其他平台是分销商？提交订单证明即可</text>
        </view>
        <text class="option-arrow" :class="{ rotated: showImportForm }">›</text>
      </view>

      <!-- 导入表单 -->
      <view class="import-form" v-if="showImportForm">
        <view class="form-tip">
          <text class="tip-icon">💡</text>
          <text class="tip-text">提交你在其他平台的订单截图或订单号，我们客服会人工审核</text>
        </view>

        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            type="number"
            v-model="form.phone"
            placeholder="请输入注册手机号"
            maxlength="11"
          />
        </view>

        <view class="form-item">
          <text class="form-label">订单来源</text>
          <picker :value="sourceIndex" :range="sources" @change="onSourceChange">
            <view class="form-picker">
              <text>{{ sources[sourceIndex] }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">订单号</text>
          <input
            class="form-input"
            type="text"
            v-model="form.importOrderNo"
            placeholder="请输入其他平台的订单号"
          />
        </view>

        <view class="form-item">
          <text class="form-label">订单截图（选填）</text>
          <view class="upload-area" @click="chooseImage">
            <text class="upload-icon">📷</text>
            <text class="upload-text" v-if="!form.imageUrl">点击上传截图</text>
            <image v-else :src="form.imageUrl" class="preview-image" mode="aspectFit" />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">备注（选填）</text>
          <textarea
            class="form-textarea"
            v-model="form.remark"
            placeholder="补充说明，如订单时间、金额等"
            maxlength="200"
          />
        </view>

        <view class="form-actions">
          <button class="btn-primary" :loading="submitting" @click="submitImport">
            提交审核
          </button>
        </view>

        <!-- 审核状态查询 -->
        <view class="status-query" @click="queryStatus">
          <text class="query-text">查看审核进度</text>
          <text class="query-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 审核状态弹窗 -->
    <view class="modal" v-if="showStatusModal">
      <view class="modal-mask" @click="showStatusModal = false" />
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">审核进度</text>
          <text class="modal-close" @click="showStatusModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="status-item" v-if="!statusData">
            <text class="status-text">暂无申请记录</text>
          </view>
          <view class="status-item" v-else>
            <view class="status-row">
              <text class="status-label">状态：</text>
              <text class="status-value" :class="'status-' + statusData.status">
                {{ statusData.status === 'pending' ? '待审核' : statusData.status === 'approved' ? '已通过' : '已拒绝' }}
              </text>
            </view>
            <view class="status-row">
              <text class="status-label">订单号：</text>
              <text class="status-value">{{ statusData.importOrderNo }}</text>
            </view>
            <view class="status-row">
              <text class="status-label">来源：</text>
              <text class="status-value">{{ statusData.importSource }}</text>
            </view>
            <view class="status-row" v-if="statusData.reviewRemark">
              <text class="status-label">审核备注：</text>
              <text class="status-value">{{ statusData.reviewRemark }}</text>
            </view>
            <view class="status-row">
              <text class="status-label">提交时间：</text>
              <text class="status-value">{{ formatDate(statusData.createdAt) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { post, get } from '@/utils/request'

const userStore = useUserStore()

const userInfo = computed(() => ({
  nickname: userStore.state.nickname,
  avatar: userStore.state.avatar,
  isDistributor: userStore.state.isDistributor,
  userId: userStore.state.userId,
  phone: userStore.state.phone
}))

const showImportForm = ref(false)
const showStatusModal = ref(false)
const submitting = ref(false)
const sourceIndex = ref(0)
const sources = ['淘宝', '京东', '拼多多', '抖音', '小红书', '其他']

const form = ref({
  phone: '',
  importOrderNo: '',
  remark: '',
  imageUrl: ''
})

const statusData = ref(null)

onMounted(() => {
  // 如果用户已登录，预填手机号
  if (userInfo.value.phone) {
    form.value.phone = userInfo.value.phone
  }
})

function goBack() {
  uni.navigateBack()
}

function goToProduct() {
  uni.navigateTo({ url: '/pages/product/product' })
}

function onSourceChange(e) {
  sourceIndex.value = e.detail.value
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 简单处理：直接存临时路径展示
      // 实际应上传到服务器，这里只是演示
      form.value.imageUrl = res.tempFilePaths[0]
    }
  })
}

async function submitImport() {
  // 基本校验
  if (!form.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(form.value.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  if (!form.value.importOrderNo) {
    uni.showToast({ title: '请输入订单号', icon: 'none' })
    return
  }

  submitting.value = true

  try {
    const res = await post('/import/submit', {
      userId: userInfo.value.userId || undefined,
      phone: form.value.phone,
      nickname: userInfo.value.nickname || undefined,
      importOrderNo: form.value.importOrderNo,
      importSource: sources[sourceIndex.value],
      remark: form.value.remark || undefined
    })

    if (res.code === 200) {
      uni.showToast({ title: '提交成功，请等待审核', icon: 'success' })
      showImportForm.value = false
      // 清空表单
      form.value.importOrderNo = ''
      form.value.remark = ''
      form.value.imageUrl = ''
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' })
    }
  } catch (err) {
    uni.showToast({ title: '提交失败', icon: 'none' })
    console.error('提交导入申请失败:', err)
  } finally {
    submitting.value = false
  }
}

async function queryStatus() {
  if (!form.value.phone && !userInfo.value.userId) {
    uni.showToast({ title: '请先输入手机号', icon: 'none' })
    return
  }

  try {
    const res = await get('/import/status', {
      userId: userInfo.value.userId || undefined,
      phone: form.value.phone || userInfo.value.phone || undefined
    })

    if (res.code === 200 && res.data) {
      statusData.value = res.data
    } else {
      statusData.value = null
      uni.showToast({ title: res.message || '暂无申请记录', icon: 'none' })
    }
  } catch (err) {
    statusData.value = null
    uni.showToast({ title: '查询失败', icon: 'none' })
  }

  showStatusModal.value = true
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.join-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.back-btn {
  font-size: 48rpx;
  color: #333;
  margin-right: 20rpx;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.already-distributor {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  background: #fff;
}

.success-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.success-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.success-sub {
  font-size: 28rpx;
  color: #999;
}

.section {
  padding: 30rpx;
}

.option-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.option-icon {
  font-size: 50rpx;
  margin-right: 20rpx;
}

.option-content {
  flex: 1;
}

.option-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.option-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.option-arrow {
  font-size: 36rpx;
  color: #ccc;
  transition: transform 0.3s;
}

.option-arrow.rotated {
  transform: rotate(90deg);
}

.import-form {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
}

.form-tip {
  display: flex;
  background: #f0f9ff;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.tip-icon {
  margin-right: 10rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #1890ff;
  flex: 1;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.picker-arrow {
  font-size: 32rpx;
  color: #ccc;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  border: 2rpx dashed #ddd;
}

.upload-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.preview-image {
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
}

.form-textarea {
  width: 100%;
  height: 150rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-actions {
  margin-top: 40rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:active {
  opacity: 0.9;
}

.status-query {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30rpx;
  padding: 20rpx;
}

.query-text {
  font-size: 26rpx;
  color: #1890ff;
}

.query-arrow {
  font-size: 28rpx;
  color: #1890ff;
  margin-left: 5rpx;
}

/* 审核状态弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.modal-body {
  padding: 30rpx;
}

.status-item {
  padding: 10rpx 0;
}

.status-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  display: block;
  padding: 40rpx 0;
}

.status-row {
  display: flex;
  margin-bottom: 20rpx;
}

.status-label {
  font-size: 28rpx;
  color: #666;
  width: 160rpx;
}

.status-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.status-pending {
  color: #faad14;
}

.status-approved {
  color: #52c41a;
}

.status-rejected {
  color: #ff4d4f;
}
</style>
