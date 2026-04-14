<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">出行打车</text>
      <view class="city-select" @click="showCityPicker = true">
        <text>{{ currentCity }}</text>
        <text class="arrow">▼</text>
      </view>
    </view>

    <view class="location-tip" @click="getLocation">
      <text class="location-icon">📍</text>
      <text class="location-text">{{ locationLoading ? '正在定位...' : '点击定位获取附近车辆' }}</text>
      <text class="location-arrow">›</text>
    </view>

    <view class="coupon-section" v-if="hasData">
      <view class="section-title">🚗 出行优惠券</view>
      <scroll-view class="coupon-scroll" scroll-x>
        <view class="coupon-list">
          <view class="coupon-item" v-for="item in coupons" :key="item.id" @click="receiveCoupon(item)">
            <view class="coupon-left">
              <text class="coupon-price">¥{{ item.amount }}</text>
              <text class="coupon-condition">立减</text>
            </view>
            <view class="coupon-right">
              <text class="receive-text">{{ item.received ? '已领取' : '立即领取' }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section">
      <view class="section-title">🚙 选择打车平台</view>
      <view class="platform-list">
        <view class="platform-item" v-for="item in platforms" :key="item.id" @click="goToMiniProgram(item.appId)">
          <view class="platform-icon">{{ item.icon }}</view>
          <view class="platform-info">
            <text class="platform-name">{{ item.name }}</text>
            <text class="platform-desc">{{ item.desc }}</text>
          </view>
          <view class="platform-btn">叫车</view>
        </view>
      </view>
      <view class="empty-tip" v-if="!hasData">
        <text>接入CPS平台后将显示真实商家</text>
      </view>
    </view>

    <view class="section steps-section">
      <view class="section-title">📝 使用方法</view>
      <view class="steps">
        <view class="step"><view class="step-num">1</view><text class="step-text">点击上方按钮唤起打车</text></view>
        <view class="step"><view class="step-num">2</view><text class="step-text">输入目的地</text></view>
        <view class="step"><view class="step-num">3</view><text class="step-text">自动抵扣优惠</text></view>
      </view>
    </view>

    <view v-if="showCityPicker" class="city-modal" @click="showCityPicker = false">
      <view class="city-panel" @click.stop>
        <view class="city-header">
          <text class="city-title">选择城市</text>
          <text class="close-btn" @click="showCityPicker = false">✕</text>
        </view>
        <view class="city-list">
          <view class="city-item" v-for="item in cities" :key="item" :class="{ active: currentCity === item }" @click="selectCity(item)">{{ item }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const goBack = () => uni.navigateBack()
const showCityPicker = ref(false)
const currentCity = ref('杭州')
const locationLoading = ref(false)
const hasData = ref(true)
const cities = ['杭州', '上海', '北京', '广州', '深圳', '成都', '重庆']

const getLocation = () => {
  locationLoading.value = true
  uni.getLocation({
    type: 'gcj02',
    success: () => { locationLoading.value = false; hasData.value = true },
    fail: () => { locationLoading.value = false; hasData.value = true }
  })
}

const selectCity = (city) => {
  currentCity.value = city
  showCityPicker.value = false
}

const coupons = ref([
  {id:1,amount:10,received:false},
  {id:2,amount:15,received:false},
  {id:3,amount:20,received:false}
])

const receiveCoupon = (item) => {
  if (!item.received) {
    item.received = true
    uni.showToast({title:'优惠券已领取',icon:'success'})
  }
}

const platforms = ref([
  {id:1,name:'滴滴出行',desc:'全城立减',icon:'🚗',appId:'wxidf6a2b44a76bf5d6e'},
  {id:2,name:'T3出行',desc:'新人专享',icon:'🚙',appId:''},
  {id:3,name:'曹操出行',desc:'折扣优惠',icon:'🚕',appId:''}
])

const goToMiniProgram = (appId) => {
  if (appId) {
    uni.navigateToMiniProgram({
      appId: appId,
      path: 'pages/index/index',
      fail: () => uni.showToast({title:'请先更新微信',icon:'none'})
    })
  } else {
    uni.showToast({title:'该平台暂不支持',icon:'none'})
  }
}
</script>

<style scoped>
.container{min-height:100vh;background:#f5f7fa}
.header{background:linear-gradient(135deg,#667eea,#5f27cd);padding:50rpx 30rpx 30rpx;border-radius:0 0 30rpx 30rpx;display:flex;align-items:center}
.back-btn{font-size:48rpx;color:#fff;margin-right:20rpx;font-weight:bold}
.page-title{font-size:36rpx;font-weight:bold;color:#fff;flex:1}
.city-select{display:flex;align-items:center;background:rgba(255,255,255,0.2);padding:10rpx 20rpx;border-radius:30rpx;color:#fff;font-size:26rpx}
.arrow{font-size:18rpx;margin-left:8rpx}
.location-tip{display:flex;align-items:center;background:#fff;margin:20rpx;padding:20rpx;border-radius:12rpx}
.location-icon{font-size:32rpx;margin-right:12rpx}
.location-text{flex:1;font-size:26rpx;color:#333}
.location-arrow{font-size:32rpx;color:#999}
.coupon-section{background:#fff;margin:0 20rpx 20rpx;border-radius:16rpx;padding:20rpx}
.section-title{font-size:28rpx;font-weight:bold;color:#333;margin-bottom:16rpx}
.coupon-scroll{white-space:nowrap}
.coupon-list{display:inline-flex;gap:16rpx}
.coupon-item{display:flex;align-items:center;width:200rpx;flex-shrink:0;background:linear-gradient(90deg,#667eea,#5f27cd);border-radius:12rpx;overflow:hidden}
.coupon-left{flex:1;padding:16rpx}
.coupon-price{display:block;font-size:36rpx;font-weight:bold;color:#fff}
.coupon-condition{font-size:20rpx;color:rgba(255,255,255,0.8)}
.coupon-right{background:rgba(255,255,255,0.2);padding:20rpx 16rpx}
.receive-text{font-size:22rpx;color:#fff}
.section{padding:20rpx}
.platform-list{}
.platform-item{display:flex;align-items:center;background:#fff;border-radius:16rpx;padding:24rpx;margin-bottom:20rpx}
.platform-icon{font-size:60rpx;margin-right:20rpx}
.platform-info{flex:1}
.platform-name{display:block;font-size:28rpx;font-weight:bold;color:#333}
.platform-desc{font-size:24rpx;color:#888;display:block;margin-top:6rpx}
.platform-btn{background:linear-gradient(135deg,#667eea,#5f27cd);color:#fff;padding:16rpx 32rpx;border-radius:30rpx;font-size:26rpx}
.steps-section{background:#fff;border-radius:16rpx;margin:20rpx;padding:24rpx}
.steps{display:flex;justify-content:space-around}
.step{display:flex;flex-direction:column;align-items:center}
.step-num{width:48rpx;height:48rpx;background:#667eea;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26rpx;font-weight:bold;margin-bottom:8rpx}
.step-text{font-size:24rpx;color:#666}
.empty-tip{text-align:center;padding:40rpx;color:#999;font-size:26rpx}
.city-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:flex;align-items:flex-end}
.city-panel{width:100%;background:#fff;border-radius:24rpx 24rpx 0 0;max-height:70vh}
.city-header{display:flex;justify-content:space-between;align-items:center;padding:30rpx;border-bottom:1rpx solid #eee}
.city-title{font-size:30rpx;font-weight:bold}
.close-btn{font-size:32rpx;color:#999}
.city-list{display:flex;flex-wrap:wrap;padding:20rpx;gap:16rpx}
.city-item{width:calc(25% - 12rpx);text-align:center;padding:20rpx 0;background:#f5f7fa;border-radius:12rpx;font-size:26rpx;color:#333}
.city-item.active{background:#667eea;color:#fff}
</style>
