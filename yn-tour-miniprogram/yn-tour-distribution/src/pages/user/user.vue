<template>
  <view class="user">
    <!-- 顶部Header -->
    <view class="header">
      <!-- 未登录状态 -->
      <view class="user-info unlogin" v-if="!isLoggedIn" @click="doLogin">
        <view class="avatar-wrap">
          <image class="avatar" src="/static/avatar.png" mode="aspectFill" />
        </view>
        <view class="info">
          <text class="nickname">点击登录 / 注册</text>
          <view class="level-tag">
            <text class="level-text">登录后享受分销权益</text>
          </view>
        </view>
        <text class="login-arrow">›</text>
      </view>

      <!-- 已登录状态 -->
      <view class="user-info" v-else>
        <view class="avatar-wrap">
          <image class="avatar" :src="userInfo.avatar || '/static/avatar.png'" mode="aspectFill" />
          <view class="avatar-badge" v-if="userInfo.isDistributor">VIP</view>
        </view>
        <view class="info">
          <text class="nickname">{{ userInfo.nickname || '微信用户' }}</text>
          <view class="level-tag" :class="userInfo.isDistributor ? 'distributor' : 'normal'">
            <text class="level-icon">💎</text>
            <text class="level-text">{{ userInfo.isDistributor ? '分销商' : '普通会员' }}</text>
          </view>
        </view>
        <view class="logout-btn" @click="doLogout">退出</view>
      </view>
    </view>

    <!-- 收益卡片 -->
    <view class="earnings-card">
      <view class="earnings-header">
        <text class="earnings-label">我的收益</text>
        <text class="earnings-withdraw" @click="goToWithdrawRecord">提现 ›</text>
      </view>
      <view class="earnings-amount">¥<text class="amount-num">{{ earnings.availableCommission || '0.00' }}</text></view>
      <view class="earnings-btns">
        <button class="earnings-btn primary" @click="goToWithdraw">提现</button>
        <button class="earnings-btn" @click="goToCommissionDetail">明细</button>
      </view>
    </view>

    <!-- 收益统计 -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-value">{{ userInfo.selfOrderNum || 0 }}</text>
        <text class="stat-label">直推订单</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ teamStats.directPushNum || 0 }}</text>
        <text class="stat-label">间推订单</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ teamStats.totalMembers || 0 }}</text>
        <text class="stat-label">团队人数</text>
      </view>
    </view>

    <!-- 未成为分销商 - 开通卡片 -->
    <view class="open-card" v-if="isLoggedIn && !userInfo.isDistributor">
      <view class="open-header">
        <text class="open-icon">🌟</text>
        <text class="open-title">成为分销商，开启躺赚之旅</text>
      </view>
      <view class="open-desc">
        <text>购买799元旅游套餐，即可成为分销商，享受：</text>
        <view class="open-item">• 直推30%+70%分佣</view>
        <view class="open-item">• 间推10%分佣</view>
        <view class="open-item">• 7人成团额外800元</view>
        <view class="open-item">• 永久团队分红</view>
      </view>
      <view class="open-action">
        <button class="open-btn" @click="openDistributor">立即开通 ¥799</button>
      </view>
      <view class="open-alt" @click="goToImport">已有订单？导入订单免费开通</view>
    </view>

    <!-- 分销规则 -->
    <view class="rule-card">
      <view class="rule-header">
        <text class="rule-icon">📊</text>
        <text class="rule-title">分销规则</text>
      </view>
      <view class="rule-list">
        <view class="rule-item">
          <view class="rule-level level-1">一级分销</view>
          <view class="rule-desc">直推奖励 30% = ¥239.7/单</view>
        </view>
        <view class="rule-item">
          <view class="rule-level level-2">二级分销</view>
          <view class="rule-desc">间推奖励 70% = ¥559.3/单</view>
        </view>
        <view class="rule-item">
          <view class="rule-level level-3">裂变奖励</view>
          <view class="rule-desc">用户下单后自动发放佣金</view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" v-for="(item, index) in menuList" :key="index" @click="handleMenu(item.action)">
        <view class="menu-icon-wrap"><text class="menu-icon">{{ item.icon }}</text></view>
        <text class="menu-text">{{ item.title }}</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 底部TabBar占位 -->
    <view class="tabbar-placeholder"></view>

    <!-- 登录遮罩 -->
    <view class="login-modal" v-if="showLoginModal">
      <view class="login-card">
        <view class="login-header">
          <text class="login-title">登录 / 注册</text>
          <text class="login-close" @click="showLoginModal = false">✕</text>
        </view>
        <view class="login-body">
          <!-- 登录方式切换 -->
          <view class="login-tabs">
            <view class="login-tab" :class="{ active: loginTab === 'wechat' }" @click="loginTab = 'wechat'">微信登录</view>
            <view class="login-tab" :class="{ active: loginTab === 'phone' }" @click="loginTab = 'phone'">手机登录</view>
          </view>

          <!-- 微信登录 -->
          <view v-if="loginTab === 'wechat'">
            <view class="login-desc">登录后即可享受分销权益，查看收益明细</view>
            <button class="wx-login-btn" :loading="logging" @click="confirmLogin">
              <text class="wx-icon">📱</text>
              <text>{{ logging ? '登录中...' : '微信一键登录' }}</text>
            </button>
            <view class="login-tip">登录即表示同意《用户协议》和《隐私政策》</view>
          </view>

          <!-- 手机号登录 -->
          <view v-if="loginTab === 'phone'">
            <view class="phone-form">
              <view class="phone-input-wrap">
                <input
                  class="phone-input"
                  v-model="phoneForm.phone"
                  type="number"
                  maxlength="11"
                  placeholder="请输入手机号"
                />
              </view>
              <view class="sms-input-wrap">
                <input
                  class="sms-input"
                  v-model="phoneForm.code"
                  type="number"
                  maxlength="6"
                  placeholder="请输入验证码"
                />
                <button class="sms-btn" :disabled="smsCountdown > 0" @click="handleSendSmsCode">
                  {{ smsCountdown > 0 ? smsCountdown + 's' : '获取验证码' }}
                </button>
              </view>
              <button class="phone-login-btn" :loading="logging" @click="confirmPhoneLogin">
                {{ logging ? '登录中...' : '登录 / 注册' }}
              </button>
              <view class="login-tip">登录即表示同意《用户协议》和《隐私政策》</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 开通分销商遮罩 -->
    <view class="open-modal" v-if="showOpenModal">
      <view class="open-modal-card">
        <view class="open-modal-header">
          <text>开通分销商</text>
          <text class="open-modal-close" @click="showOpenModal = false">✕</text>
        </view>
        <view class="open-modal-body">
          <view class="open-price">
            <text class="price-symbol">¥</text>
            <text class="price-num">799</text>
          </view>
          <view class="open-price-desc">购买云南6天5晚旅游套餐，即可成为分销商</view>
          
          <!-- 测试环境提示 -->
          <view class="test-tip" v-if="isDev">
            <text>🛠️ 开发环境：支付测试模式</text>
          </view>
          
          <view class="payment-methods">
            <view class="payment-title">支付方式</view>
            <view class="payment-item selected">
              <text class="payment-icon">💰</text>
              <text class="payment-name">微信支付</text>
              <text class="payment-check">✓</text>
            </view>
          </view>
          
          <button class="pay-btn" :loading="paying" @click="confirmPay">
            {{ paying ? '支付中...' : '确认支付 ¥799' }}
          </button>
          
          <view class="pay-tip">支付成功后立即开通分销商身份，可查看专属推广码</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { wxLoginAndBind, getUserEarnings, getMyTeam, getCurrentUserInfo, becomeDistributor, sendSmsCode, phoneLogin } from '../../api/user'

const userStore = useUserStore()

// 分享给好友
onShareAppMessage(() => {
  return {
    title: '云南6天5晚跟团游，只要799！一起旅行一起赚！',
    path: `/pages/user/user?referrerId=${userStore.state.userId}`,
    imageUrl: '/static/banner.jpg'
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: '云南旅行799元6天5晚，一起旅行一起赚！',
    query: `referrerId=${userStore.state.userId}`,
    imageUrl: '/static/banner.jpg'
  }
})
const showLoginModal = ref(false)
const showOpenModal = ref(false)
const logging = ref(false)
const paying = ref(false)
const userInfo = ref({})
const earnings = ref({})
const teamStats = ref({})
const loginTab = ref('wechat')
const phoneForm = ref({ phone: '', code: '' })
const smsCountdown = ref(0)
let smsTimer = null

const isLoggedIn = computed(() => userStore.state.isLoggedIn)

// 判断是否开发环境
const isDev = computed(() => {
  // #ifndef MP-WEIXIN
  return true
  // #endif
  // #ifdef MP-WEIXIN
  return false
  // #endif
})

onShow(async () => {
  if (userStore.state.isLoggedIn) {
    await loadUserData()
  }
})

async function loadUserData() {
  try {
    // 获取用户信息
    const userRes = await getCurrentUserInfo()
    if (userRes.code === 200 && userRes.data) {
      userInfo.value = userRes.data
      userStore.setUser({
        nickname: userRes.data.nickname,
        avatar: userRes.data.avatar,
        isDistributor: userRes.data.isDistributor
      })
    }

    // 获取收益数据
    if (userStore.state.userId) {
      const earningsRes = await getUserEarnings({ userId: userStore.state.userId })
      if (earningsRes.code === 200 && earningsRes.data) {
        const d = earningsRes.data
        // 字段名对齐：后端字段名 -> 前端显示名
        earnings.value = {
          totalCommission: d.totalEarnings || 0,
          availableCommission: d.availableBalance || 0,
          frozenCommission: d.frozenBalance || 0,
          selfOrderNum: d.selfOrderNum || 0,
          directPushNum: d.directPushNum || 0,
          teamOrderNum: d.totalTeamOrders || 0,
          groupNum: d.groupNum || 0,
          teamCount: d.teamCount || 0,
        }
      }

      // 获取团队数据
      const teamRes = await getMyTeam({ userId: userStore.state.userId })
      if (teamRes.code === 200 && teamRes.data) {
        const ts = teamRes.data.teamStats || {}
        const my = teamRes.data.myStats || {}
        teamStats.value = {
          totalMembers: teamRes.data.teamMembers?.length || 0,
          directPushNum: my.totalDirectPushNum || 0,
          selfOrderNum: my.selfOrderNum || 0,
          totalOrders: ts.totalOrders || 0,
        }
      }
    }
  } catch (e) {
    console.error('加载用户数据失败:', e)
  }
}

async function doLogin() {
  showLoginModal.value = true
  loginTab.value = 'wechat'
  phoneForm.value = { phone: '', code: '' }
}

async function confirmLogin() {
  if (logging.value) return
  logging.value = true
  
  try {
    const user = await wxLoginAndBind()
    userInfo.value = user
    await loadUserData()
    showLoginModal.value = false
    uni.showToast({ title: '登录成功', icon: 'success' })
  } catch (e) {
    console.error('登录失败:', e)
    uni.showToast({ title: '登录失败: ' + (e.message || '请重试'), icon: 'none' })
  } finally {
    logging.value = false
  }
}

async function handleSendSmsCode() {
  if (smsCountdown.value > 0) return
  const phone = phoneForm.value.phone
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  try {
    const res = await sendSmsCode(phone)
    if (res.code === 200) {
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      smsCountdown.value = 60
      smsTimer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) {
          clearInterval(smsTimer)
        }
      }, 1000)
    } else {
      uni.showToast({ title: res.message || '发送失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '发送失败，请重试', icon: 'none' })
  }
}

async function confirmPhoneLogin() {
  if (logging.value) return
  const { phone, code } = phoneForm.value
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!code || code.length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return
  }
  logging.value = true
  try {
    const res = await phoneLogin({
      phone,
      code,
      referrerId: userStore.state.referrerId || undefined
    })
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
      userStore.setUser({
        userId: res.data._id,
        openid: res.data.openid,
        nickname: res.data.nickname,
        avatar: res.data.avatar,
        phone: res.data.phone,
        isDistributor: res.data.isDistributor
      })
      await loadUserData()
      showLoginModal.value = false
      uni.showToast({ title: '登录成功', icon: 'success' })
    } else {
      uni.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  } catch (e) {
    console.error('登录失败:', e)
    uni.showToast({ title: '登录失败: ' + (e.message || '请重试'), icon: 'none' })
  } finally {
    logging.value = false
  }
}

function doLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        userInfo.value = {}
        earnings.value = {}
        teamStats.value = {}
        uni.showToast({ title: '已退出登录', icon: 'none' })
      }
    }
  })
}

function openDistributor() {
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    showLoginModal.value = true
    return
  }
  showOpenModal.value = true
}

async function confirmPay() {
  if (paying.value) return
  paying.value = true
  
  try {
    // 开发环境：直接开通（跳过真实支付）
    // #ifndef MP-WEIXIN
    await becomeDistributor({ userId: userStore.state.userId })
    userInfo.value.isDistributor = true
    userStore.setDistributor(true)
    showOpenModal.value = false
    uni.showToast({ title: '开通成功！你是分销商了', icon: 'success' })
    // #endif
    
    // 真实微信支付流程（上线时启用）
    // #ifdef MP-WEIXIN
    // TODO: 调用微信支付
    uni.showToast({ title: '支付功能待集成', icon: 'none' })
    // #endif
  } catch (e) {
    console.error('开通失败:', e)
    uni.showToast({ title: '开通失败: ' + (e.message || '请重试'), icon: 'none' })
  } finally {
    paying.value = false
  }
}

function goToWithdraw() {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }
  uni.showToast({ title: '提现功能开发中', icon: 'none' })
}

function goToCommissionDetail() {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }
  uni.showToast({ title: '明细功能开发中', icon: 'none' })
}

function goToWithdrawRecord() {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }
  uni.showToast({ title: '提现记录开发中', icon: 'none' })
}

const menuList = [
  { title: '我的订单', icon: '📋', action: 'orders' },
  { title: '我的团队', icon: '👥', action: 'team' },
  { title: '佣金明细', icon: '💰', action: 'commission' },
  { title: '邀请好友', icon: '🔗', action: 'invite' },
  { title: '推广海报', icon: '🖼️', action: 'poster' },
  { title: '淘宝订单导入', icon: '📦', action: 'import' },
  { title: 'CPS订单', icon: '🛒', action: 'cpsOrder' },
  { title: '设置', icon: '⚙️', action: 'settings' },
]

const handleMenu = (action) => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }
  
  if (action === 'import') {
    uni.navigateTo({ url: '/pages/import/import' })
    return
  }
  const titles = { orders: '我的订单', team: '我的团队', commission: '佣金明细', invite: '邀请好友', poster: '推广海报', cpsOrder: 'CPS订单', settings: '设置' }
  uni.showToast({ title: `${titles[action]}开发中`, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.user { min-height: 100vh; background: #f0f2f5; }

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 100rpx;
  border-radius: 0 0 50rpx 50rpx;
}

.user-info { display: flex; align-items: center; }
.user-info.unlogin { cursor: pointer; }
.user-info.unlogin:active { opacity: 0.9; }
.avatar-wrap { position: relative; }
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.3); background: #fff; }
.avatar-badge {
  position: absolute; bottom: 0; right: 0; background: linear-gradient(135deg, #ffd700, #ff9500);
  color: #fff; font-size: 18rpx; font-weight: bold; padding: 4rpx 12rpx; border-radius: 12rpx;
}
.info { margin-left: 24rpx; flex: 1; display: flex; flex-direction: column; }
.nickname { font-size: 36rpx; color: #fff; font-weight: bold; }
.level-tag { display: inline-flex; align-items: center; background: rgba(255,255,255,0.2); padding: 6rpx 16rpx; border-radius: 20rpx; margin-top: 12rpx; width: fit-content; }
.level-tag.distributor { background: linear-gradient(135deg, #ffd700, #ff9500); }
.level-tag.normal { background: rgba(255,255,255,0.2); }
.level-icon { font-size: 24rpx; margin-right: 6rpx; }
.level-text { font-size: 22rpx; color: #fff; }
.login-arrow { font-size: 36rpx; color: rgba(255,255,255,0.5); }
.logout-btn { font-size: 24rpx; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.15); padding: 8rpx 16rpx; border-radius: 16rpx; }

/* 收益卡片 */
.earnings-card {
  background: #fff; margin: -50rpx 30rpx 20rpx; padding: 30rpx; border-radius: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(102,126,234,0.15);
}
.earnings-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.earnings-label { font-size: 26rpx; color: #666; }
.earnings-withdraw { font-size: 24rpx; color: #667eea; }
.earnings-amount { text-align: center; margin: 20rpx 0; }
.amount-num { font-size: 64rpx; font-weight: 800; color: #333; }
.earnings-btns { display: flex; justify-content: center; gap: 30rpx; }
.earnings-btn { padding: 20rpx 60rpx; font-size: 28rpx; border-radius: 40rpx; }
.earnings-btn.primary { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
.earnings-btn:not(.primary) { background: #f5f5f5; color: #333; }

/* 统计 */
.stats-row {
  display: flex; background: #fff; margin: 0 30rpx 20rpx; padding: 30rpx; border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 40rpx; font-weight: bold; color: #333; }
.stat-label { font-size: 24rpx; color: #888; margin-top: 8rpx; }
.stat-divider { width: 1rpx; background: #eee; }

/* 开通卡片 */
.open-card {
  background: linear-gradient(135deg, #ff8c00 0%, #ff5500 100%);
  margin: 0 30rpx 20rpx; padding: 30rpx; border-radius: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(255,136,0,0.3);
}
.open-header { display: flex; align-items: center; margin-bottom: 16rpx; }
.open-icon { font-size: 36rpx; margin-right: 10rpx; }
.open-title { font-size: 32rpx; font-weight: bold; color: #fff; }
.open-desc { font-size: 24rpx; color: rgba(255,255,255,0.9); margin-bottom: 24rpx; line-height: 1.8; }
.open-item { margin-left: 16rpx; }
.open-action { margin-bottom: 16rpx; }
.open-btn {
  width: 100%; background: #fff; color: #ff5500; font-size: 30rpx; font-weight: bold;
  border-radius: 40rpx; padding: 24rpx 0; border: none;
}
.open-btn::after { border: none; }
.open-alt { text-align: center; font-size: 22rpx; color: rgba(255,255,255,0.7); text-decoration: underline; }

/* 规则卡片 */
.rule-card { background: #fff; margin: 0 30rpx 20rpx; padding: 30rpx; border-radius: 20rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05); }
.rule-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 24rpx; }
.rule-icon { font-size: 32rpx; }
.rule-title { font-size: 30rpx; font-weight: bold; color: #333; }
.rule-list { display: flex; flex-direction: column; gap: 16rpx; }
.rule-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx; background: #f8f9fa; border-radius: 12rpx; }
.rule-level { font-size: 26rpx; font-weight: bold; padding: 6rpx 16rpx; border-radius: 8rpx; }
.level-1 { background: #ffe8e8; color: #ff6b6b; }
.level-2 { background: #e8f4ff; color: #667eea; }
.level-3 { background: #e8ffe8; color: #07c160; }
.rule-desc { font-size: 24rpx; color: #666; }

/* 菜单 */
.menu-section { background: #fff; margin: 0 30rpx; border-radius: 20rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05); padding: 10rpx 0; margin-bottom: 40rpx; }
.menu-item { display: flex; align-items: center; padding: 28rpx 30rpx; border-bottom: 1rpx solid #f5f5f5; }
.menu-item:last-child { border-bottom: none; }
.menu-icon-wrap { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 14rpx; margin-right: 20rpx; }
.menu-icon { font-size: 32rpx; }
.menu-text { flex: 1; font-size: 28rpx; color: #333; }
.menu-arrow { font-size: 32rpx; color: #ccc; }

.tabbar-placeholder { height: 100rpx; }

/* 登录弹窗 */
.login-modal {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 999;
  display: flex; align-items: center; justify-content: center; padding: 40rpx;
}
.login-card { width: 100%; background: #fff; border-radius: 24rpx; overflow: hidden; }
.login-header { display: flex; justify-content: space-between; align-items: center; padding: 30rpx 24rpx; border-bottom: 1rpx solid #f0f0f0; }
.login-title { font-size: 32rpx; font-weight: bold; color: #333; }
.login-close { font-size: 32rpx; color: #999; }
.login-body { padding: 30rpx 24rpx; }
.login-desc { font-size: 26rpx; color: #666; margin-bottom: 30rpx; text-align: center; }
.wx-login-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; background: linear-gradient(135deg, #07c160, #04b53e);
  color: #fff; font-size: 30rpx; font-weight: bold; padding: 28rpx 0;
  border-radius: 48rpx; border: none;
}
.wx-login-btn::after { border: none; }
.wx-icon { font-size: 36rpx; margin-right: 12rpx; }
.login-tip { font-size: 20rpx; color: #999; text-align: center; margin-top: 20rpx; }

.login-tabs { display: flex; background: #f5f7fa; border-radius: 16rpx; padding: 6rpx; margin-bottom: 24rpx; }
.login-tab { flex: 1; text-align: center; padding: 18rpx 0; font-size: 26rpx; color: #666; border-radius: 10rpx; font-weight: 500; transition: all 0.3s; }
.login-tab.active { background: #fff; color: #667eea; font-weight: 600; box-shadow: 0 2rpx 8rpx rgba(102,126,234,0.2); }
.phone-form { }
.phone-input-wrap { margin-bottom: 16rpx; }
.phone-input, .sms-input { background: #f8f9fa; border-radius: 12rpx; padding: 20rpx 24rpx; font-size: 28rpx; width: 100%; box-sizing: border-box; }
.sms-input-wrap { display: flex; gap: 12rpx; margin-bottom: 20rpx; }
.sms-input { flex: 1; }
.sms-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 24rpx; font-weight: bold; padding: 0 24rpx; border-radius: 12rpx; border: none; white-space: nowrap; }
.sms-btn::after { border: none; }
.sms-btn[disabled] { background: #ccc; }
.phone-login-btn { width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 30rpx; font-weight: bold; padding: 26rpx 0; border-radius: 48rpx; border: none; margin-bottom: 16rpx; }
.phone-login-btn::after { border: none; }

/* 开通弹窗 */
.open-modal {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 999;
  display: flex; align-items: flex-end; justify-content: center;
}
.open-modal-card { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding-bottom: 60rpx; }
.open-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 30rpx 24rpx; border-bottom: 1rpx solid #f0f0f0; font-size: 32rpx; font-weight: bold; color: #333; }
.open-modal-close { font-size: 32rpx; color: #999; }
.open-modal-body { padding: 30rpx 24rpx; }
.open-price { text-align: center; margin-bottom: 12rpx; }
.price-symbol { font-size: 32rpx; color: #ff5500; }
.price-num { font-size: 72rpx; font-weight: 800; color: #ff5500; }
.open-price-desc { text-align: center; font-size: 24rpx; color: #666; margin-bottom: 24rpx; }
.test-tip { background: #fffbe6; border: 1rpx solid #ffe58f; border-radius: 8rpx; padding: 12rpx 16rpx; font-size: 22rpx; color: #ad6800; text-align: center; margin-bottom: 24rpx; }
.payment-methods { margin-bottom: 24rpx; }
.payment-title { font-size: 26rpx; color: #666; margin-bottom: 12rpx; }
.payment-item { display: flex; align-items: center; padding: 20rpx; background: #f8f9fa; border-radius: 12rpx; border: 2rpx solid #eee; }
.payment-item.selected { border-color: #07c160; background: #f0fff0; }
.payment-icon { font-size: 36rpx; margin-right: 12rpx; }
.payment-name { flex: 1; font-size: 28rpx; color: #333; }
.payment-check { font-size: 28rpx; color: #07c160; }
.pay-btn {
  width: 100%; background: linear-gradient(135deg, #07c160, #04b53e);
  color: #fff; font-size: 30rpx; font-weight: bold; padding: 28rpx 0;
  border-radius: 48rpx; border: none; margin-bottom: 16rpx;
}
.pay-btn::after { border: none; }
.pay-tip { font-size: 22rpx; color: #999; text-align: center; }
</style>
