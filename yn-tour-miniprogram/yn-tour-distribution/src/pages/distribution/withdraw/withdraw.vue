<template>
  <view class="withdraw-page">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">💰 提现</text>
    </view>

    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="balance-label">可提现佣金</view>
      <view class="balance-amount">¥{{ earningsInfo.availableCommission || '0.00' }}</view>
      <view class="balance-stats">
        <view class="stat-item">
          <text class="stat-label">累计佣金</text>
          <text class="stat-value">¥{{ earningsInfo.totalCommission || '0.00' }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">冻结中</text>
          <text class="stat-value frozen">¥{{ earningsInfo.frozenCommission || '0.00' }}</text>
        </view>
      </view>
    </view>

    <!-- 提现表单 -->
    <view class="form-card">
      <!-- 提现金额 -->
      <view class="form-item">
        <view class="form-label">提现金额</view>
        <view class="amount-input-wrap">
          <text class="yuan">¥</text>
          <input
            class="amount-input"
            type="digit"
            v-model="formData.amount"
            placeholder="最低100元"
            :disabled="loading"
            @input="onAmountInput"
          />
        </view>
        <view class="amount-tip" v-if="calcResult">
          <text>手续费1%，实际到账 </text>
          <text class="actual">¥{{ calcResult.actualAmount }}</text>
        </view>
      </view>

      <!-- 提现方式 -->
      <view class="form-item">
        <view class="form-label">提现方式</view>
        <view class="method-list">
          <view
            class="method-item"
            :class="{ active: formData.withdrawMethod === 'wechat' }"
            @click="formData.withdrawMethod = 'wechat'"
          >
            <text class="method-icon">💬</text>
            <text class="method-name">微信</text>
            <text class="method-check" v-if="formData.withdrawMethod === 'wechat'">✓</text>
          </view>
          <view
            class="method-item"
            :class="{ active: formData.withdrawMethod === 'alipay' }"
            @click="formData.withdrawMethod = 'alipay'"
          >
            <text class="method-icon">💙</text>
            <text class="method-name">支付宝</text>
            <text class="method-check" v-if="formData.withdrawMethod === 'alipay'">✓</text>
          </view>
          <view
            class="method-item"
            :class="{ active: formData.withdrawMethod === 'bank' }"
            @click="formData.withdrawMethod = 'bank'"
          >
            <text class="method-icon">🏦</text>
            <text class="method-name">银行卡</text>
            <text class="method-check" v-if="formData.withdrawMethod === 'bank'">✓</text>
          </view>
        </view>
      </view>

      <!-- 账户信息 -->
      <view class="form-item">
        <view class="form-label">账户信息</view>

        <!-- 微信 -->
        <view v-if="formData.withdrawMethod === 'wechat'">
          <input class="form-input" type="text" v-model="formData.openid" placeholder="请输入微信OpenID（联系客服获取）" :disabled="loading" />
        </view>

        <!-- 支付宝 -->
        <view v-if="formData.withdrawMethod === 'alipay'">
          <input class="form-input" type="text" v-model="formData.alipayAccount" placeholder="请输入支付宝账号" :disabled="loading" />
          <input class="form-input" type="text" v-model="formData.alipayName" placeholder="请输入真实姓名" :disabled="loading" style="margin-top: 16rpx" />
        </view>

        <!-- 银行卡 -->
        <view v-if="formData.withdrawMethod === 'bank'">
          <input class="form-input" type="text" v-model="formData.bankName" placeholder="请输入银行名称" :disabled="loading" />
          <input class="form-input" type="text" v-model="formData.bankAccount" placeholder="请输入银行卡号" :disabled="loading" style="margin-top: 16rpx" />
          <input class="form-input" type="text" v-model="formData.bankAccountName" placeholder="请输入持卡人姓名" :disabled="loading" style="margin-top: 16rpx" />
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" :disabled="!canSubmit || loading" @click="handleSubmit">
        {{ loading ? '提交中...' : '确认提现' }}
      </button>
      <view class="submit-tip">提现申请提交后，预计1-3个工作日到账</view>
    </view>

    <!-- 提现记录入口 -->
    <view class="record-entry" @click="goToWithdrawRecord">
      <text>提现记录</text>
      <text class="arrow">›</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getUserEarnings, calculateWithdraw, applyWithdraw } from '@/api/user'

const userStore = useUserStore()

const earningsInfo = ref({
  totalCommission: 0,
  availableCommission: 0,
  frozenCommission: 0
})
const calcResult = ref(null)
const loading = ref(false)

const formData = ref({
  amount: '',
  withdrawMethod: 'wechat',
  openid: '',
  alipayAccount: '',
  alipayName: '',
  bankName: '',
  bankAccount: '',
  bankAccountName: ''
})

onShow(() => {
  loadEarnings()
})

async function loadEarnings() {
  const userId = userStore.state.userId
  if (!userId) return
  try {
    const res = await getUserEarnings({ userId })
    if (res.code === 200 && res.data) {
      earningsInfo.value = {
        totalCommission: res.data.totalCommission || 0,
        availableCommission: res.data.availableCommission || 0,
        frozenCommission: res.data.frozenCommission || 0
      }
    }
  } catch (e) {
    console.error('加载收益信息失败', e)
  }
}

async function onAmountInput() {
  calcResult.value = null
  const amount = parseFloat(formData.value.amount)
  if (isNaN(amount) || amount <= 0) return

  // 最低100元
  if (amount < 100) return

  // 计算手续费
  const fee = Math.max(amount * 0.01, 1)
  calcResult.value = {
    actualAmount: (amount - fee).toFixed(2)
  }
}

const canSubmit = computed(() => {
  const amount = parseFloat(formData.value.amount)
  if (!amount || amount < 100) return false
  if (amount > earningsInfo.value.availableCommission) return false

  const method = formData.value.withdrawMethod
  if (method === 'wechat' && !formData.value.openid) return false
  if (method === 'alipay' && (!formData.value.alipayAccount || !formData.value.alipayName)) return false
  if (method === 'bank' && (!formData.value.bankName || !formData.value.bankAccount || !formData.value.bankAccountName)) return false
  return true
})

async function handleSubmit() {
  const amount = parseFloat(formData.value.amount)
  if (!amount || amount < 100) {
    uni.showToast({ title: '最低提现金额100元', icon: 'none' })
    return
  }
  if (amount > earningsInfo.value.availableCommission) {
    uni.showToast({ title: '超过可提现额度', icon: 'none' })
    return
  }

  const userId = userStore.state.userId
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  // 构建账户信息
  const accountInfo = {}
  if (formData.value.withdrawMethod === 'wechat') {
    accountInfo.openid = formData.value.openid
  } else if (formData.value.withdrawMethod === 'alipay') {
    accountInfo.alipayAccount = formData.value.alipayAccount
    accountInfo.alipayName = formData.value.alipayName
  } else if (formData.value.withdrawMethod === 'bank') {
    accountInfo.bankName = formData.value.bankName
    accountInfo.bankAccount = formData.value.bankAccount
    accountInfo.bankAccountName = formData.value.bankAccountName
  }

  loading.value = true
  try {
    const res = await applyWithdraw({
      userId,
      withdrawMethod: formData.value.withdrawMethod,
      accountInfo,
      amount
    })
    if (res.code === 200) {
      uni.showModal({
        title: '提交成功',
        content: '提现申请已提交，请等待审核',
        showCancel: false,
        success: () => {
          formData.value.amount = ''
          calcResult.value = null
          loadEarnings()
        }
      })
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goToWithdrawRecord() {
  uni.showToast({ title: '提现记录功能开发中', icon: 'none' })
}
</script>

<style scoped>
.withdraw-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #ff8c00, #ff6600);
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

.balance-card {
  background: linear-gradient(135deg, #ff8c00, #ff6600);
  margin: 24rpx;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  color: #fff;
}

.balance-label {
  font-size: 26rpx;
  color: rgba(255,255,255,0.85);
  margin-bottom: 10rpx;
}

.balance-amount {
  font-size: 60rpx;
  font-weight: bold;
  color: #fff;
}

.balance-stats {
  display: flex;
  gap: 40rpx;
  margin-top: 20rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.7);
}

.stat-value {
  font-size: 26rpx;
  color: #fff;
}

.stat-value.frozen {
  color: rgba(255,255,255,0.6);
}

.form-card {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 20rpx;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #eee;
  padding-bottom: 16rpx;
}

.yuan {
  font-size: 48rpx;
  color: #333;
  font-weight: bold;
  margin-right: 10rpx;
}

.amount-input {
  flex: 1;
  font-size: 48rpx;
  color: #333;
  font-weight: bold;
  height: 60rpx;
}

.amount-tip {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
}

.amount-tip .actual {
  color: #ff6600;
  font-weight: bold;
}

.method-list {
  display: flex;
  gap: 20rpx;
}

.method-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  position: relative;
}

.method-item.active {
  border-color: #ff6600;
  background: #fff7e6;
}

.method-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.method-name {
  font-size: 24rpx;
  color: #666;
}

.method-item.active .method-name {
  color: #ff6600;
  font-weight: bold;
}

.method-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  font-size: 22rpx;
  color: #ff6600;
  font-weight: bold;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
}

.submit-section {
  padding: 0 24rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #ff8c00, #ff6600);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
}

.submit-btn[disabled] {
  background: #ccc;
  color: #fff;
}

.submit-tip {
  text-align: center;
  font-size: 22rpx;
  color: #999;
  margin-top: 16rpx;
}

.record-entry {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  margin-top: 30rpx;
  font-size: 26rpx;
  color: #666;
}

.record-entry .arrow {
  font-size: 32rpx;
  color: #ccc;
}
</style>
