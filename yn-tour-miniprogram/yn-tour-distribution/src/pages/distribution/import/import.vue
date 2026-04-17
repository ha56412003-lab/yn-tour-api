<template>
  <view class="import-page">
    <!-- 顶部Header -->
    <view class="header">
      <view class="header-back" @click="goBack">‹</view>
      <text class="header-title">淘宝订单导入</text>
      <view class="header-right"></view>
    </view>

    <!-- 说明区 -->
    <view class="intro-section">
      <view class="intro-card">
        <view class="intro-icon">📋</view>
        <view class="intro-content">
          <view class="intro-title">什么是订单导入？</view>
          <view class="intro-desc">如果你已经在其他平台（如淘宝、携程、飞猪等）购买过云南旅行套餐，只需导入订单编号，即可<text class="highlight">免费开通分销商身份</text>，无需重复购买。</view>
        </view>
      </view>
    </view>

    <!-- 状态展示（已提交/已通过/被拒绝） -->
    <view class="status-section" v-if="applyStatus">
      <view class="status-card" :class="applyStatus.status">
        <view class="status-icon">{{ statusIcon }}</view>
        <view class="status-info">
          <view class="status-title">{{ statusTitle }}</view>
          <view class="status-desc">{{ statusDesc }}</view>
          <view class="status-remark" v-if="applyStatus.reviewRemark">
            审核备注：{{ applyStatus.reviewRemark }}
          </view>
          <view class="status-time" v-if="applyStatus.reviewedAt">
            审核时间：{{ formatTime(applyStatus.reviewedAt) }}
          </view>
        </view>
      </view>
    </view>

    <!-- 申请表单 -->
    <view class="form-section" v-else>
      <view class="form-card">
        <view class="form-title">填写订单信息</view>

        <!-- 手机号 -->
        <view class="form-item">
          <view class="form-label">手机号 <text class="required">*</text></view>
          <input
            class="form-input"
            v-model="form.phone"
            type="number"
            maxlength="11"
            placeholder="请输入购买时留的手机号"
          />
        </view>

        <!-- 订单来源 -->
        <view class="form-item">
          <view class="form-label">订单来源 <text class="required">*</text></view>
          <view class="source-grid">
            <view
              class="source-item"
              :class="{ selected: form.importSource === item.value }"
              v-for="item in sourceOptions"
              :key="item.value"
              @click="form.importSource = item.value"
            >
              <text class="source-icon">{{ item.icon }}</text>
              <text class="source-name">{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 订单编号 -->
        <view class="form-item">
          <view class="form-label">订单编号 <text class="required">*</text></view>
          <input
            class="form-input"
            v-model="form.importOrderNo"
            type="text"
            placeholder="请输入其他平台的订单编号"
          />
        </view>

        <!-- 昵称（非必填） -->
        <view class="form-item">
          <view class="form-label">昵称</view>
          <input
            class="form-input"
            v-model="form.nickname"
            type="text"
            placeholder="选填，方便客服联系"
          />
        </view>

        <!-- 提交按钮 -->
        <button class="submit-btn" :loading="submitting" @click="submitApply">
          {{ submitting ? '提交中...' : '提交审核' }}
        </button>

        <!-- 提示 -->
        <view class="submit-tip">
          <text>⚠️ 提交后预计1-2个工作日内审核完成，请保持手机畅通</text>
        </view>
      </view>
    </view>

    <!-- 常见问题 -->
    <view class="faq-section">
      <view class="faq-title">常见问题</view>
      <view class="faq-list">
        <view class="faq-item" v-for="(item, index) in faqList" :key="index">
          <view class="faq-q">Q{{ index + 1 }}: {{ item.q }}</view>
          <view class="faq-a">{{ item.a }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { submitImportOrder, getImportStatus } from '@/api/user'

const userStore = useUserStore()

const form = ref({
  phone: '',
  importSource: 'taobao',
  importOrderNo: '',
  nickname: ''
})

const submitting = ref(false)
const applyStatus = ref(null)

const sourceOptions = [
  { label: '淘宝', value: 'taobao', icon: '🛒' },
  { label: '携程', value: 'ctrip', icon: '✈️' },
  { label: '飞猪', value: 'fliggy', icon: '🐷' },
  { label: '去哪儿', value: 'qunar', icon: '🏖️' },
  { label: '美团', value: 'meituan', icon: '🍔' },
  { label: '其他', value: 'other', icon: '📱' },
]

const faqList = [
  {
    q: '哪些平台购买的订单可以导入？',
    a: '淘宝、携程、飞猪、去哪儿、美团等主流旅游平台购买的云南旅行套餐订单均可导入。'
  },
  {
    q: '导入订单需要提供什么信息？',
    a: '需要提供：购买时留的手机号、平台订单编号、订单来源平台。'
  },
  {
    q: '导入审核需要多长时间？',
    a: '一般情况下1-2个工作日内完成审核，审核结果会以短信形式通知。'
  },
  {
    q: '导入通过后可以享受哪些权益？',
    a: '通过后立即成为分销商，享受一级30%+二级70%的分佣权益，以及团队裂变奖励。'
  }
]

const statusIcon = computed(() => {
  if (!applyStatus.value) return ''
  switch (applyStatus.value.status) {
    case 'pending': return '⏳'
    case 'approved': return '✅'
    case 'rejected': return '❌'
    default: return '📋'
  }
})

const statusTitle = computed(() => {
  if (!applyStatus.value) return ''
  switch (applyStatus.value.status) {
    case 'pending': return '审核中'
    case 'approved': return '审核通过'
    case 'rejected': return '审核未通过'
    default: return '未知状态'
  }
})

const statusDesc = computed(() => {
  if (!applyStatus.value) return ''
  switch (applyStatus.value.status) {
    case 'pending': return '您的订单正在审核中，请耐心等待...'
    case 'approved': return '恭喜！您的订单已审核通过，已成为分销商'
    case 'rejected': return '很遗憾，您的订单未通过审核'
    default: return ''
  }
})

onShow(async () => {
  // 如果已登录，检查是否有待审核/历史的导入申请
  if (userStore.state.isLoggedIn && userStore.state.userId) {
    try {
      const phone = userStore.state.phone || ''
      if (phone) {
        const res = await getImportStatus({ userId: userStore.state.userId, phone })
        if (res.code === 200 && res.data) {
          applyStatus.value = res.data
        }
      }
    } catch (e) {
      console.error('查询导入状态失败:', e)
    }
  }
  
  // 如果用户已登录且有手机号，自动填充
  if (userStore.state.phone) {
    form.value.phone = userStore.state.phone
  }
})

async function submitApply() {
  // 表单验证
  if (!form.value.phone || !/^1[3-9]\d{9}$/.test(form.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!form.value.importOrderNo) {
    uni.showToast({ title: '请输入订单编号', icon: 'none' })
    return
  }
  if (!form.value.importSource) {
    uni.showToast({ title: '请选择订单来源', icon: 'none' })
    return
  }

  if (submitting.value) return
  submitting.value = true

  try {
    const res = await submitImportOrder({
      userId: userStore.state.userId || undefined,
      phone: form.value.phone,
      nickname: form.value.nickname || undefined,
      importOrderNo: form.value.importOrderNo,
      importSource: form.value.importSource
    })

    if (res.code === 200) {
      uni.showToast({ title: '提交成功，请等待审核', icon: 'success' })
      // 刷新状态
      const statusRes = await getImportStatus({ phone: form.value.phone })
      if (statusRes.code === 200 && statusRes.data) {
        applyStatus.value = statusRes.data
      }
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' })
    }
  } catch (e) {
    console.error('提交失败:', e)
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.import-page { min-height: 100vh; background: #f0f2f5; }

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-back { font-size: 48rpx; color: #fff; font-weight: 300; }
.header-title { font-size: 32rpx; font-weight: bold; color: #fff; }
.header-right { width: 60rpx; }

.intro-section { padding: 20rpx 30rpx; }
.intro-card {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  gap: 16rpx;
  border: 1rpx solid #ffe58f;
}
.intro-icon { font-size: 48rpx; flex-shrink: 0; }
.intro-content { flex: 1; }
.intro-title { font-size: 28rpx; font-weight: bold; color: #1a1a2e; margin-bottom: 8rpx; }
.intro-desc { font-size: 24rpx; color: #666; line-height: 1.6; }
.intro-desc .highlight { color: #ff5500; font-weight: bold; }

/* 状态卡片 */
.status-section { padding: 20rpx 30rpx; }
.status-card {
  background: #fff; border-radius: 16rpx; padding: 30rpx;
  display: flex; gap: 20rpx; align-items: flex-start;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
}
.status-card.pending { border-left: 6rpx solid #ffb300; }
.status-card.approved { border-left: 6rpx solid #07c160; }
.status-card.rejected { border-left: 6rpx solid #ff4d4f; }
.status-icon { font-size: 56rpx; }
.status-info { flex: 1; }
.status-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.status-desc { font-size: 26rpx; color: #666; margin-bottom: 8rpx; }
.status-remark { font-size: 24rpx; color: #999; background: #f5f5f5; padding: 8rpx 12rpx; border-radius: 6rpx; margin-top: 8rpx; }
.status-time { font-size: 22rpx; color: #999; margin-top: 8rpx; }

/* 表单区 */
.form-section { padding: 20rpx 30rpx; }
.form-card { background: #fff; border-radius: 16rpx; padding: 30rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08); }
.form-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 30rpx; }
.form-item { margin-bottom: 30rpx; }
.form-label { font-size: 26rpx; color: #333; margin-bottom: 12rpx; font-weight: 500; }
.required { color: #ff4d4f; }
.form-input { background: #f8f9fa; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; }

/* 来源选择 */
.source-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.source-item {
  display: flex; flex-direction: column; align-items: center;
  padding: 16rpx 20rpx; border-radius: 12rpx; border: 2rpx solid #eee;
  min-width: 100rpx; background: #f8f9fa;
}
.source-item.selected { border-color: #667eea; background: #f0f4ff; }
.source-icon { font-size: 36rpx; margin-bottom: 6rpx; }
.source-name { font-size: 22rpx; color: #333; }

/* 提交按钮 */
.submit-btn {
  width: 100%; background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; font-size: 30rpx; font-weight: bold; padding: 26rpx 0;
  border-radius: 48rpx; border: none; margin-top: 10rpx;
}
.submit-btn::after { border: none; }

.submit-tip { font-size: 22rpx; color: #999; text-align: center; margin-top: 16rpx; }

/* FAQ */
.faq-section { padding: 20rpx 30rpx 60rpx; }
.faq-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
.faq-list { display: flex; flex-direction: column; gap: 16rpx; }
.faq-item { background: #fff; border-radius: 12rpx; padding: 20rpx; }
.faq-q { font-size: 26rpx; color: #333; font-weight: 500; margin-bottom: 8rpx; }
.faq-a { font-size: 24rpx; color: #666; line-height: 1.6; }
</style>
