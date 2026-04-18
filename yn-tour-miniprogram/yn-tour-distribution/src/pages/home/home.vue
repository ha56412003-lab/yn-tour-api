<template>
  <view class="container">
    <AnnouncementPopup />
    <!-- 顶部Header -->
    <view class="header">
      <view class="header-top">
        <text class="brand-name">团游</text>
        <text class="brand-desc">一起游·更省钱</text>
        <view class="login-tip" v-if="!isLoggedIn" @click="goToLogin">
          <text>登录/注册</text>
        </view>
        <view class="user-badge" v-else>
          <text class="user-name">{{ userInfo.nickname || '用户' }}</text>
        </view>
      </view>
      <view class="search-box" @click="onSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索功能、路线...</text>
      </view>
    </view>

    <!-- 第一屏 -->
    <view class="section1">
      <view class="hero-product" @click="goToProduct">
        <image
          class="product-img"
          :src="homeConfig?.bannerImage ? fullUrl(homeConfig.bannerImage) : '/static/product-bg.jpg'"
          mode="aspectFill"
        />
        <view class="product-tag">热卖</view>
        <view class="product-info">
          <text class="product-name">{{ homeConfig?.linkedProduct?.name || '云南6天5晚 · 轻奢游' }}</text>
          <view class="product-price-wrap">
            <text class="product-price">¥{{ getProductPrice() ?? '—' }}</text>
            <text class="product-original" v-if="homeConfig?.linkedProduct?.originalPrice">¥{{ homeConfig.linkedProduct.originalPrice }}</text>
          </view>
        </view>
        <view class="buy-btn" @click.stop="goToProduct">立刻购买</view>
      </view>
      
      <view class="distribute-btns">
        <view class="distribute-btn primary" @click="goToRegister">
          <view class="btn-content">
            <text class="btn-icon">💰</text>
            <view class="btn-text-wrap">
              <text class="btn-text">加入团游</text>
              <text class="btn-subtext">分佣赚钱</text>
            </view>
          </view>
        </view>
        <view class="distribute-btn secondary" @click="goToShareTask">
          <view class="btn-content">
            <text class="btn-icon">💰</text>
            <view class="btn-text-wrap">
              <text class="btn-text">一键分享，即刻躺赚</text>
              <text class="btn-subtext">分享成功！有人点击即锁客30天，下单你就赚</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 第二屏 -->
    <view class="section2">
      <view class="section-header">
        <view class="section-title">
          <text class="title-text">🏪 便民服务</text>
          <text class="title-tag">领券下单享优惠</text>
        </view>
      </view>
      <scroll-view class="cps-scroll" scroll-x="true" :show-scrollbar="false">
        <view class="cps-track">
          <view class="cps-item" v-for="item in cpsChannels" :key="item.id" @click="goToCPS(item.id)">
            <view class="cps-icon-wrap" :style="{background: item.color}">
              <text class="cps-icon">{{ item.icon }}</text>
            </view>
            <text class="cps-name">{{ item.name }}</text>
            <text class="cps-subname">{{ item.subName }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 第三屏：团队排行榜 -->
    <view class="section3">
      <view class="section-title-bar">
        <view class="title-left">
          <text class="title-icon">🏆</text>
          <text class="title-text">团队收益排行</text>
        </view>
        <view class="title-right">
          <text class="title-desc">实时更新</text>
        </view>
      </view>
      
      <!-- 时间筛选 -->
      <view class="rank-tabs">
        <view class="tab-item" :class="{ active: timeType === 'month' }" @click="switchTime('month')">当月</view>
        <view class="tab-item" :class="{ active: timeType === 'lastMonth' }" @click="switchTime('lastMonth')">上月</view>
        <view class="tab-item" :class="{ active: timeType === 'all' }" @click="switchTime('all')">累计</view>
      </view>
      
      <!-- Top 3 -->
      <view class="top3">
        <view class="top-item second" v-if="rankData[1]">
          <view class="rank-icon">🥈</view>
          <image class="top-avatar" :src="rankData[1].avatar || '/static/avatar.png'"></image>
          <text class="top-name">{{ formatName(rankData[1].nickname) }}</text>
          <view class="top-stats">
            <text class="stat-tag"><text class="stat-label">自购</text>{{ rankData[1].selfOrderNum || 0 }}</text>
            <text class="stat-tag"><text class="stat-label">直推</text>{{ rankData[1].directPushNum || 0 }}</text>
            <text class="stat-tag"><text class="stat-label">团队</text>{{ (rankData[1].selfOrderNum || 0) + (rankData[1].directPushNum || 0) }}</text>
            <text class="stat-tag"><text class="stat-label">成团</text>{{ rankData[1].groupNum || 0 }}</text>
          </view>
          <view class="top-earnings">可提现¥{{ formatMoney(rankData[1].totalEarnings || 0) }}</view>
        </view>
        <view class="top-item first" v-if="rankData[0]">
          <view class="rank-icon">🥇</view>
          <image class="top-avatar" :src="rankData[0].avatar || '/static/avatar.png'"></image>
          <text class="top-name">{{ formatName(rankData[0].nickname) }}</text>
          <view class="top-stats">
            <text class="stat-tag"><text class="stat-label">自购</text>{{ rankData[0].selfOrderNum || 0 }}</text>
            <text class="stat-tag"><text class="stat-label">直推</text>{{ rankData[0].directPushNum || 0 }}</text>
            <text class="stat-tag"><text class="stat-label">团队</text>{{ (rankData[0].selfOrderNum || 0) + (rankData[0].directPushNum || 0) }}</text>
            <text class="stat-tag"><text class="stat-label">成团</text>{{ rankData[0].groupNum || 0 }}</text>
          </view>
          <view class="top-earnings">可提现¥{{ formatMoney(rankData[0].totalEarnings || 0) }}</view>
        </view>
        <view class="top-item third" v-if="rankData[2]">
          <view class="rank-icon">🥉</view>
          <image class="top-avatar" :src="rankData[2].avatar || '/static/avatar.png'"></image>
          <text class="top-name">{{ formatName(rankData[2].nickname) }}</text>
          <view class="top-stats">
            <text class="stat-tag"><text class="stat-label">自购</text>{{ rankData[2].selfOrderNum || 0 }}</text>
            <text class="stat-tag"><text class="stat-label">直推</text>{{ rankData[2].directPushNum || 0 }}</text>
            <text class="stat-tag"><text class="stat-label">团队</text>{{ (rankData[2].selfOrderNum || 0) + (rankData[2].directPushNum || 0) }}</text>
            <text class="stat-tag"><text class="stat-label">成团</text>{{ rankData[2].groupNum || 0 }}</text>
          </view>
          <view class="top-earnings">可提现¥{{ formatMoney(rankData[2].totalEarnings || 0) }}</view>
        </view>
      </view>
      
      <!-- 4-10名 -->
      <view class="rank-list-mini">
        <view class="rank-item" v-for="(item, index) in rankData.slice(3, 10)" :key="index">
          <view class="rank-num">{{ index + 4 }}</view>
          <image class="rank-avatar" :src="item.avatar || '/static/avatar.png'"></image>
          <view class="rank-info">
            <text class="rank-name">{{ formatName(item.nickname) }}</text>
            <view class="rank-stats">
              <text class="stat-tag"><text class="stat-label">自购</text>{{ item.selfOrderNum || 0 }}</text>
              <text class="stat-tag"><text class="stat-label">直推</text>{{ item.directPushNum || 0 }}</text>
              <text class="stat-tag"><text class="stat-label">团队</text>{{ (item.selfOrderNum || 0) + (item.directPushNum || 0) }}</text>
              <text class="stat-tag"><text class="stat-label">成团</text>{{ item.groupNum || 0 }}</text>
            </view>
          </view>
          <view class="rank-earnings">可提现¥{{ formatMoney(item.totalEarnings || 0) }}</view>
        </view>
      </view>
      
      <!-- 更多按钮 -->
      <view class="more-btn" @click="goToRanking">
        <text>查看更多</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 搜索弹窗 -->
    <view v-if="showSearch" class="search-modal" @click="showSearch = false">
      <view class="search-panel" @click.stop>
        <view class="search-input-wrap">
          <text class="search-icon">🔍</text>
          <input class="search-input" v-model="searchKeyword" placeholder="搜索功能、路线..." focus @input="onSearchInput" />
        </view>
        <view class="search-results" v-if="searchResults.length > 0">
          <view class="result-item" v-for="(item, index) in searchResults" :key="index" @click="handleResultClick(item)">
            <text class="result-icon">{{ item.icon }}</text>
            <text class="result-text">{{ item.title }}</text>
          </view>
        </view>
        <view class="search-tips" v-else-if="searchKeyword">
          <text class="tips-text">未找到相关功能</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { wxLoginAndBind, getTeamRanking } from '../../api/user'
import { getHomeConfig } from '../../api/homeConfig'
import AnnouncementPopup from '../../components/AnnouncementPopup.vue'

const userStore = useUserStore()
const timeType = ref('month')
const showSearch = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const rankData = ref([])
const userInfo = ref({})

// 首页配置（海报+关联产品）
interface HomeConfigType {
  bannerImage: string
  linkedProductId: string
  linkedProductName: string
  linkedProduct: { _id: string; name: string; price: number; promotionPrice: number; mainImages: string[] }
}
const homeConfig = ref<HomeConfigType | null>(null)

function fullUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // TODO: 部署前需改为实际域名，如 'https://your-domain.com'
  // 当前为开发环境内网IP，线上需替换为真实服务器地址
  const base = 'http://192.168.10.14:3000'
  return path.startsWith('/') ? base + path : base + '/' + path
}

async function loadHomeConfig() {
  try {
    const res = await getHomeConfig()
    if (res.code === 200 && res.data) {
      homeConfig.value = res.data as any
    }
  } catch (e) {
    console.error('加载首页配置失败', e)
  }
}

function getProductPrice() {
  const p = homeConfig.value?.linkedProduct
  if (!p) return null
  return p.isPromotion && p.promotionPrice ? p.promotionPrice : p.price
}

// 分享给好友
onShareAppMessage(() => {
  const productName = homeConfig.value?.linkedProduct?.name || '云南6天5晚跟团游'
  const price = getProductPrice()
  return {
    title: `${productName}，只要${price}！一起旅行一起赚！`,
    path: `/pages/home/home?referrerId=${userStore.state.userId}`,
    imageUrl: homeConfig.value?.bannerImage ? fullUrl(homeConfig.value.bannerImage) : '/static/banner.jpg'
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  const price = getProductPrice()
  return {
    title: `云南旅行${price}元6天5晚，一起旅行一起赚！`,
    query: `referrerId=${userStore.state.userId}`,
    imageUrl: homeConfig.value?.bannerImage ? fullUrl(homeConfig.value.bannerImage) : '/static/banner.jpg'
  }
})

const isLoggedIn = computed(() => userStore.state.isLoggedIn)

onShow(async () => {
  // 1. 自动登录
  if (!userStore.state.isLoggedIn) {
    try {
      userInfo.value = await wxLoginAndBind()
    } catch (e) {
      console.error('自动登录失败:', e)
    }
  } else {
    userInfo.value = {
      nickname: userStore.state.nickname,
      avatar: userStore.state.avatar
    }
  }
  
  // 2. 加载排行榜数据
  await loadRanking()
  // 3. 加载首页配置（海报+关联产品）
  await loadHomeConfig()
})

async function loadRanking() {
  try {
    const res = await getTeamRanking({ limit: 10 })
    if (res.code === 200 && res.data) {
      // 筛选当月/上月/累计数据
      // 后端返回的 ranking 数据有 createdAt 和 earnings 字段
      rankData.value = res.data || []
    }
  } catch (e) {
    console.error('加载排行榜失败:', e)
    // 降级用空数组
    rankData.value = []
  }
}

const cpsChannels = ref([
  { id: 1, name: '酒店民宿', subName: '专享特价', icon: '🏨', color: 'linear-gradient(135deg, #ff6b6b, #ff8e53)' },
  { id: 3, name: '美团优惠券', subName: '天天领', icon: '🍔', color: 'linear-gradient(135deg, #ffd700, #ff9500)' },
  { id: 4, name: '饿了么优惠券', subName: '天天领', icon: '🍜', color: 'linear-gradient(135deg, #ff6b9d, #c75cd8)' },
  { id: 6, name: '滴滴打车券', subName: '天天领', icon: '🚗', color: 'linear-gradient(135deg, #667eea, #5f27cd)' },
])

const formatName = (name) => {
  if (!name || name.length < 2) return name || '匿名'
  const lastChar = name[name.length - 1]
  const asterisk = '*'.repeat(name.length - 1)
  return asterisk + lastChar
}

const switchTime = (type) => {
  timeType.value = type
}

const formatMoney = (money) => {
  const num = parseFloat(money)
  if (isNaN(num)) return '0'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const goToRanking = () => {
  uni.navigateTo({ url: `/pages/ranking/ranking?type=${timeType.value}` })
}

const allFunctions = [
  { title: '首页', icon: '🏠', path: '/pages/home/home' },
  { title: '帮助文档', icon: '📖', path: '/pages/help/help' },
  { title: '预约出行', icon: '📅', path: '/pages/booking/booking' },
  { title: '我的', icon: '👤', path: '/pages/user/user' },
  { title: '团队排行', icon: '🏆', path: '/pages/team/team' },
  { title: '我的订单', icon: '📋', path: '/pages/order/order' },
]

const channelMap = {
  1: '/pages/cps/channels/hotel',
  3: '/pages/cps/channels/meituan',
  4: '/pages/cps/channels/elem',
  6: '/pages/cps/channels/taxi',
}

const onSearch = () => {
  showSearch.value = true
  searchKeyword.value = ''
  searchResults.value = []
}

const onSearchInput = () => {
  if (!searchKeyword.value) {
    searchResults.value = []
    return
  }
  const keyword = searchKeyword.value.toLowerCase()
  searchResults.value = allFunctions.filter(item => item.title.toLowerCase().includes(keyword))
}

const handleResultClick = (item) => {
  showSearch.value = false
  uni.switchTab({ url: item.path })
}

const goToProduct = () => {
  const productId = homeConfig.value?.linkedProduct?._id
  if (productId) {
    uni.navigateTo({ url: `/pages/product/product?productId=${productId}` })
  } else {
    uni.navigateTo({ url: '/pages/product/product' })
  }
}
const goToRegister = () => uni.navigateTo({ url: '/pages/distribution/join/join' })
const goToShareTask = () => uni.navigateTo({ url: '/pages/share/share' })
const goToLogin = () => uni.navigateTo({ url: '/pages/user/user' })

const goToCPS = (id) => {
  const path = channelMap[id]
  if (path) {
    uni.navigateTo({ url: path })
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #f0f2f5; }

.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12rpx 30rpx 20rpx; border-radius: 0 0 20rpx 20rpx; }
.header-top { display: flex; align-items: baseline; margin-bottom: 10rpx; }
.brand-name { font-size: 32rpx; font-weight: 800; color: #fff; margin-right: 8rpx; }
.brand-desc { font-size: 18rpx; color: rgba(255,255,255,0.8); flex: 1; }
.login-tip {
  font-size: 22rpx; color: #fff; background: rgba(255,255,255,0.25);
  padding: 6rpx 16rpx; border-radius: 20rpx;
}
.user-badge { }
.user-name { font-size: 24rpx; color: #fff; background: rgba(255,255,255,0.2); padding: 4rpx 16rpx; border-radius: 20rpx; }
.search-box { display: flex; align-items: center; background: rgba(255,255,255,0.95); border-radius: 28rpx; padding: 10rpx 18rpx; }
.search-icon { font-size: 22rpx; margin-right: 8rpx; }
.search-placeholder { font-size: 24rpx; color: #999; }

.section1 { padding: 0; margin: 20rpx; }
.hero-product { position: relative; border-radius: 20rpx; overflow: hidden; height: 380rpx; box-shadow: 0 8rpx 24rpx rgba(102,126,234,0.2); }
.product-img { width: 100%; height: 100%; }
.product-tag { position: absolute; top: 16rpx; left: 16rpx; background: linear-gradient(135deg, #ff6b6b, #ff8e53); color: #fff; font-size: 20rpx; font-weight: bold; padding: 6rpx 16rpx; border-radius: 16rpx; }
.product-info { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 24rpx; }
.product-name { display: block; font-size: 36rpx; font-weight: bold; color: #fff; margin-bottom: 8rpx; }
.product-price-wrap { display: flex; align-items: baseline; }
.product-price { font-size: 44rpx; font-weight: 800; color: #ffd700; }
.product-original { font-size: 24rpx; color: rgba(255,255,255,0.6); text-decoration: line-through; margin-left: 16rpx; }
.buy-btn { position: absolute; bottom: 20rpx; right: 20rpx; background: linear-gradient(135deg, #ff6b6b, #ff8e53); color: #fff; font-size: 22rpx; font-weight: bold; padding: 12rpx 24rpx; border-radius: 24rpx; box-shadow: 0 4rpx 12rpx rgba(255,107,107,0.4); }

.distribute-btns { display: flex; gap: 16rpx; margin-top: 20rpx; }
.distribute-btn { flex: 1; border-radius: 16rpx; overflow: hidden; }
.btn-content { display: flex; align-items: center; padding: 20rpx; }
.distribute-btn.primary { background: linear-gradient(135deg, #ffd700, #ff9500); }
.distribute-btn.primary .btn-text { color: #1a1a2e; }
.distribute-btn.primary .btn-subtext { color: rgba(26,26,46,0.7); }
.distribute-btn.secondary { background: #fff; border: 2rpx solid #eee; }
.distribute-btn.secondary .btn-text { color: #333; }
.distribute-btn.secondary .btn-subtext { color: #888; }
.btn-icon { font-size: 36rpx; margin-right: 10rpx; }
.btn-text-wrap { display: flex; flex-direction: column; }
.btn-text { font-size: 26rpx; font-weight: bold; }
.btn-subtext { font-size: 20rpx; }

.section2 { background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%); margin: 20rpx; border-radius: 24rpx; padding: 24rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08); overflow: hidden; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { display: flex; align-items: center; gap: 10rpx; }
.title-text { font-size: 30rpx; font-weight: bold; color: #333; }
.title-tag { background: linear-gradient(135deg, #ff8c00, #ff5500); color: #fff; font-size: 18rpx; padding: 6rpx 14rpx; border-radius: 16rpx; }

.cps-scroll { white-space: nowrap; }
.cps-track { display: inline-flex; padding: 10rpx 0; }
.cps-item { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; padding: 24rpx 20rpx; background: #fff; border-radius: 20rpx; margin-right: 16rpx; min-width: 150rpx; border: 2rpx solid #f0f0f0; transition: all 0.3s; }
.cps-item:last-child { margin-right: 0; }
.cps-item:active { transform: scale(0.95); border-color: #ff8c00; }
.cps-icon-wrap { width: 80rpx; height: 80rpx; display: flex; align-items: center; justify-content: center; border-radius: 20rpx; margin-bottom: 12rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1); }
.cps-icon { font-size: 40rpx; }
.cps-name { font-size: 24rpx; color: #333; margin-bottom: 4rpx; text-align: center; font-weight: 600; }
.cps-subname { font-size: 20rpx; color: #888; text-align: center; }

/* 排行榜模块 */
.section3 { background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%); margin: 20rpx; border-radius: 24rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08); margin-bottom: 40rpx; overflow: hidden; }

.section-title-bar { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 24rpx 16rpx; border-bottom: 1rpx solid #f0f0f0; }
.title-left { display: flex; align-items: center; }
.title-icon { font-size: 36rpx; margin-right: 10rpx; }
.title-text { font-size: 32rpx; font-weight: 700; color: #1a1a2e; }
.title-right { display: flex; align-items: center; }
.title-desc { font-size: 20rpx; color: #999; background: #f5f7fa; padding: 6rpx 14rpx; border-radius: 20rpx; }

.rank-tabs { display: flex; background: #f5f7fa; border-radius: 16rpx; padding: 6rpx; margin: 20rpx 24rpx; }
.tab-item { flex: 1; text-align: center; padding: 18rpx 0; font-size: 26rpx; color: #666; border-radius: 12rpx; font-weight: 500; transition: all 0.3s; }
.tab-item.active { background: linear-gradient(135deg, #ff8c00, #ff5500); color: #fff; font-weight: 600; box-shadow: 0 4rpx 12rpx rgba(255,136,0,0.4); }

.top3 { display: flex; justify-content: center; align-items: flex-end; padding: 20rpx 10rpx; }
.top-item { display: flex; flex-direction: column; align-items: center; flex: 1; text-align: center; }
.first { order: 2; transform: translateY(-24rpx); }
.second { order: 1; }
.third { order: 3; }
.rank-icon { margin-bottom: 6rpx; }
.first .rank-icon { font-size: 52rpx; }
.second .rank-icon, .third .rank-icon { font-size: 40rpx; }
.top-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; margin: 10rpx 0; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15); }
.first .top-avatar { width: 108rpx; height: 108rpx; border: 5rpx solid #ffd700; box-shadow: 0 6rpx 20rpx rgba(255,215,0,0.5); }
.second .top-avatar { border: 4rpx solid #c0c0c0; }
.third .top-avatar { border: 4rpx solid #cd7f32; }
.top-name { font-size: 26rpx; font-weight: 600; color: #333; margin-top: 8rpx; }
.first .top-name { font-size: 30rpx; }
.top-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 8rpx; margin-top: 10rpx; }
.top-stats .stat-tag { display: inline-flex; align-items: center; font-size: 16rpx; color: #666; background: #f0f0f0; padding: 4rpx 8rpx; border-radius: 6rpx; }
.top-stats .stat-label { color: #999; font-size: 14rpx; margin-right: 2rpx; }
.top-earnings { font-size: 28rpx; font-weight: 800; color: #ff3300; margin-top: 10rpx; background: linear-gradient(135deg, #fff5f5, #ffe8e8); padding: 8rpx 16rpx; border-radius: 20rpx; }
.first .top-earnings { font-size: 34rpx; padding: 10rpx 20rpx; }

.rank-list-mini { margin-top: 16rpx; border-top: 2rpx dashed #eee; padding-top: 16rpx; }
.rank-item { display: flex; align-items: center; padding: 16rpx 12rpx; border-radius: 12rpx; margin-bottom: 8rpx; background: #fafafa; transition: all 0.2s; }
.rank-item:last-child { border-bottom: none; margin-bottom: 0; }
.rank-item:hover { background: #f5f5f5; }
.rank-num { width: 48rpx; font-size: 26rpx; color: #999; text-align: center; font-weight: 600; }
.rank-avatar { width: 56rpx; height: 56rpx; border-radius: 50%; margin: 0 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); }
.rank-info { flex: 1; }
.rank-name { font-size: 26rpx; color: #333; display: block; font-weight: 500; }
.rank-stats { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 6rpx; }
.stat-tag { display: inline-flex; align-items: center; font-size: 18rpx; color: #666; background: #f0f0f0; padding: 4rpx 10rpx; border-radius: 6rpx; }
.stat-label { color: #999; font-size: 16rpx; margin-right: 2rpx; }
.stat-tag.self { background: #e8f5e9; color: #2e7d32; }
.stat-tag.direct { background: #e3f2fd; color: #1565c0; }
.stat-tag.team { background: #fff3e0; color: #e65100; }
.stat-tag.group { background: #fce4ec; color: #c2185b; }
.rank-earnings { font-size: 26rpx; font-weight: 700; color: #ff3300; background: linear-gradient(135deg, #fff5f5, #ffe8e8); padding: 8rpx 14rpx; border-radius: 16rpx; }

.more-btn { display: flex; justify-content: center; align-items: center; margin-top: 20rpx; padding: 20rpx; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 16rpx; font-size: 26rpx; color: #fff; font-weight: 500; box-shadow: 0 4rpx 16rpx rgba(102,126,234,0.4); transition: all 0.3s; }
.more-btn:active { transform: scale(0.98); opacity: 0.9; }
.more-btn .arrow { font-size: 30rpx; margin-left: 8rpx; }

.search-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; justify-content: center; padding-top: 200rpx; }
.search-panel { width: 90%; background: #fff; border-radius: 24rpx; overflow: hidden; }
.search-input-wrap { display: flex; align-items: center; padding: 24rpx; border-bottom: 1rpx solid #eee; }
.search-input { flex: 1; font-size: 28rpx; }
.search-results { max-height: 500rpx; overflow-y: auto; }
.result-item { display: flex; align-items: center; padding: 20rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.result-icon { font-size: 32rpx; margin-right: 16rpx; }
.result-text { font-size: 28rpx; color: #333; }
.search-tips { padding: 40rpx; text-align: center; }
.tips-text { font-size: 26rpx; color: #999; }
</style>
