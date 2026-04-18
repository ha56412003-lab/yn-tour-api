<template>
  <view class="container">
    <!-- 遮罩 -->
    <view class="mask">
      <!-- 居中弹窗卡片 -->
      <view class="modal-card">
        <!-- 头部 -->
        <view class="modal-header">
          <view class="header-badge">
            <text class="badge-icon">🎯</text>
            <text class="badge-text">分销说明</text>
          </view>
          <view class="close-btn" @click="goBack">✕</view>
        </view>

        <!-- 内容区 -->
        <view class="modal-body">

          <!-- 加入条件 -->
          <view class="section">
            <view class="section-title">
              <text class="title-icon">📌</text>
              <text class="title-text">加入条件</text>
            </view>
            <view class="content-box">
              无需门槛、无需额外缴费，只需购买
              <text class="hl">799元云南6天5晚跟团游套餐</text>
              ，就能自动成为分销会员！
            </view>
          </view>

          <!-- 279分销机制 -->
          <view class="section core-section">
            <view class="section-title">
              <text class="title-icon">💰</text>
              <text class="title-text">【279分销机制】</text>
            </view>
            <view class="core-subtitle">
              <text class="sub-item"><text class="sub-num">2</text>单回本</text>
              <text class="sub-dot">·</text>
              <text class="sub-item"><text class="sub-num">7</text>单成团</text>
              <text class="sub-dot">·</text>
              <text class="sub-item"><text class="sub-num">9</text>永久收益</text>
            </view>
          </view>

          <!-- 2 二级分润，2单回本 -->
          <view class="section">
            <view class="module-header">
              <view class="module-num">2</view>
              <text class="module-title">二级分润，2单回本</text>
            </view>
            <view class="content-list">
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">直推分润：</text>第1单30%（239.7元），第2单70%（559.3元），2单回本</text>
              </view>
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">间推分润：</text>赚10%（79.9元/单）</text>
              </view>
            </view>
          </view>

          <!-- 7 七人成团，高额奖励 -->
          <view class="section">
            <view class="module-header">
              <view class="module-num">7</view>
              <text class="module-title">七人成团，高额奖励</text>
            </view>
            <view class="content-list">
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">成团规则：</text>邀请6位朋友，凑够7人成团</text>
              </view>
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">成团奖励：</text>800元/团，实时到账</text>
              </view>
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">循环收益：</text>成团后自动开启新团</text>
              </view>
            </view>
          </view>

          <!-- 9 永久分红，长期收益 -->
          <view class="section">
            <view class="module-header">
              <view class="module-num">9</view>
              <text class="module-title">永久分红，长期收益</text>
            </view>
            <view class="content-list">
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">解锁条件：</text>直推满2人 或 组建1个7人团</text>
              </view>
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">平台分红：</text>每月营业额2%均分</text>
              </view>
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">成团分红：</text>团队每新增1团额外2%</text>
              </view>
              <view class="list-row">
                <text class="bullet">-</text>
                <text class="list-text"><text class="hl">管理津贴：</text>直推用户收益的10%</text>
              </view>
            </view>
          </view>

          <!-- 分享赚钱 -->
          <view class="section">
            <view class="section-title">
              <text class="title-icon">📤</text>
              <text class="title-text">分享赚钱</text>
            </view>
            <view class="share-steps">
              <view class="share-step">
                <view class="step-num">1</view>
                <text class="step-text">点击「分享机会」，一键复制文案+海报</text>
              </view>
              <view class="step-arrow">↓</view>
              <view class="share-step">
                <view class="step-num">2</view>
                <text class="step-text">粘贴到微信群/朋友圈/抖音</text>
              </view>
              <view class="step-arrow">↓</view>
              <view class="share-step">
                <view class="step-num">3</view>
                <text class="step-text">朋友扫码下单自动成为你团队成员</text>
              </view>
            </view>
          </view>

          <!-- 选择你的加入方式 -->
          <view class="section">
            <view class="section-title">
              <text class="title-icon">🚀</text>
              <text class="title-text">选择你的加入方式</text>
            </view>
            <view class="btn-grid">
              <view class="action-btn" @click="goToProduct">
                <text class="btn-icon">💳</text>
                <text class="btn-name">购买旅游卡</text>
                <text class="btn-price">¥799</text>
                <text class="btn-tag">立即加入</text>
              </view>
              <view class="action-btn" @click="goToImport">
                <text class="btn-icon">📦</text>
                <text class="btn-name">淘宝订单导入</text>
                <text class="btn-price">0元加入</text>
                <text class="btn-tag">免购买</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { becomeDistributor } from '@/api/user'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const goBack = () => {
  uni.navigateBack()
}

const goToProduct = () => {
  uni.navigateTo({ url: '/pages/product/product' })
}

const goToImport = () => {
  uni.navigateTo({ url: '/pages/distribution/import/import' })
}

// 直接开通（测试用）
const becomeDistributorDirectly = () => {
  uni.showModal({
    title: '确认开通',
    content: '确定要直接开通分销商身份吗？（仅限测试）',
    success: async (res) => {
      if (!res.confirm) return
      uni.showLoading({ title: '开通中...' })
      try {
        const userId = userStore.state.userId
        if (!userId) {
          uni.hideLoading()
          uni.showToast({ title: '请先登录（userId空）', icon: 'none', duration: 3000 })
          return
        }
        const result = await becomeDistributor({ userId })
        uni.hideLoading()
        if (result.code === 200) {
          // 更新本地用户状态
          userStore.state.isDistributor = true
          uni.showToast({ title: '开通成功！', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 1200)
        } else {
          uni.showToast({ title: result.message || '开通失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        console.error('开通失败', e)
        const errMsg = e?.message || e?.errMsg || e?.msg || JSON.stringify(e) || '未知错误'
        uni.showToast({ title: '失败: ' + errMsg, icon: 'none', duration: 3000 })
      }
    }
  })
}
</script>

<style scoped>
page { height: 100%; overflow: hidden; }

.mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 999;
  display: flex; align-items: center; justify-content: center; padding: 40rpx;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
}

.modal-card {
  width: 100%; max-height: 90vh; background: #fff;
  border-radius: 24rpx; overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.25);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 28rpx 24rpx; display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0; position: relative;
}
.header-badge { display: flex; align-items: center; gap: 10rpx; }
.badge-icon { font-size: 32rpx; }
.badge-text { font-size: 34rpx; font-weight: bold; color: #fff; }
.close-btn {
  position: fixed; top: 20rpx; left: 20rpx; z-index: 9999;
  width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.45); border-radius: 50%; color: #fff; font-size: 30rpx;
}

.modal-body {
  flex: 1; padding: 20rpx; overflow-y: auto; -webkit-overflow-scrolling: touch;
  background: #f5f7fa;
}

/* ========== 通用区块 ========== */
.section {
  background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx;
}

/* ========== 一级标题统一样式 ========== */
.section-title {
  display: flex; align-items: center; margin-bottom: 16rpx;
}
.title-icon { font-size: 30rpx; margin-right: 8rpx; }
.title-text { font-size: 30rpx; font-weight: bold; color: #1a1a2e; }

/* ========== 高亮 ========== */
.hl { color: #ff6b6b; font-weight: bold; }

/* ========== 279核心区块 ========== */
.core-section {
  background: #fff5f5; border: 2rpx solid #ffd6d6;
  border-radius: 16rpx; padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
}
.core-section .section-title { justify-content: center; }
.core-section .title-icon { }
.core-section .title-text {
  font-size: 34rpx; font-weight: 900; color: #ff6b6b; letter-spacing: 2rpx;
}
.core-subtitle {
  display: flex; align-items: center; justify-content: center; gap: 10rpx;
}
.sub-item { font-size: 22rpx; color: #666; }
.sub-num { font-size: 26rpx; font-weight: bold; color: #ff6b6b; margin-right: 4rpx; }
.sub-dot { font-size: 22rpx; color: #ccc; }

/* ========== 子模块数字标签 ========== */
.module-header { display: flex; align-items: center; margin-bottom: 14rpx; }
.module-num {
  width: 48rpx; height: 48rpx; border-radius: 12rpx;
  background: #667eea; color: #fff; font-size: 28rpx; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  margin-right: 12rpx; flex-shrink: 0;
}
.module-title { font-size: 28rpx; font-weight: bold; color: #1a1a2e; }

/* ========== 列表 ========== */
.content-list { padding-left: 8rpx; }
.list-row { display: flex; align-items: flex-start; margin-bottom: 12rpx; }
.list-row:last-child { margin-bottom: 0; }
.bullet { font-size: 26rpx; color: #667eea; margin-right: 10rpx; font-weight: bold; line-height: 1.5; }
.list-text { font-size: 24rpx; color: #555; line-height: 1.6; flex: 1; }

/* ========== 内容框 ========== */
.content-box {
  font-size: 24rpx; color: #555; line-height: 1.7;
  background: #f8f9fa; border-radius: 10rpx; padding: 18rpx;
  border-left: 4rpx solid #667eea;
}

/* ========== 分享赚钱 ========== */
.share-steps {
  background: #667eea; border-radius: 12rpx; padding: 24rpx;
}
.share-step { display: flex; align-items: center; }
.step-num {
  width: 44rpx; height: 44rpx; border-radius: 50%;
  background: rgba(255,255,255,0.2); color: #fff; font-size: 22rpx; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
  margin-right: 14rpx; flex-shrink: 0;
}
.step-text { font-size: 24rpx; color: #fff; flex: 1; line-height: 1.5; }
.step-arrow { font-size: 24rpx; color: rgba(255,255,255,0.5); padding: 10rpx 0; text-align: center; }

/* ========== 底部按钮统一 ========== */
.btn-grid { display: flex; gap: 14rpx; }
.action-btn {
  flex: 1; background: #667eea; border-radius: 16rpx; padding: 24rpx 12rpx;
  text-align: center; transition: all 0.3s;
}
.action-btn:active { opacity: 0.85; transform: scale(0.97); }
.btn-icon { font-size: 52rpx; display: block; margin-bottom: 8rpx; }
.btn-name { font-size: 26rpx; font-weight: bold; color: #fff; display: block; margin-bottom: 6rpx; }
.btn-price { font-size: 30rpx; font-weight: 800; color: #ffd700; display: block; margin-bottom: 10rpx; }
.btn-tag {
  display: inline-block; font-size: 20rpx; color: #667eea;
  background: #fff; padding: 6rpx 16rpx; border-radius: 14rpx;
}
</style>
