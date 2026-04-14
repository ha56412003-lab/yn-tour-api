<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">加油优惠</text>
      <view class="city-select" @click="showCityPicker = true">
        <text>{{ currentCity }}</text>
        <text class="arrow">▼</text>
      </view>
    </view>

    <view class="location-tip" @click="getLocation">
      <text class="location-icon">📍</text>
      <text class="location-text">{{ locationLoading ? '正在定位...' : '点击定位获取附近加油站' }}</text>
      <text class="location-arrow">›</text>
    </view>

    <view class="coupon-section" v-if="hasData">
      <view class="section-title">🎫 加油优惠券</view>
      <scroll-view class="coupon-scroll" scroll-x>
        <view class="coupon-list">
          <view class="coupon-item" v-for="item in coupons" :key="item.id" @click="receiveCoupon(item)">
            <view class="coupon-left">
              <text class="coupon-price">¥{{ item.amount }}</text>
              <text class="coupon-condition">满{{ item.minAmount }}可用</text>
            </view>
            <view class="coupon-right">
              <text class="receive-text">{{ item.received ? '已领取' : '立即领取' }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section">
      <view class="section-title">⛽ 附近加油站 <text class="count">({{ stations.length }})</text></view>
      <view class="loading" v-if="loading"><text>正在搜索附近加油站...</text></view>
      <view class="station-list" v-else-if="hasData">
        <view class="station-item" v-for="item in stations" :key="item.id" @click="goToH5(item)">
          <view class="station-icon">⛽</view>
          <view class="station-info">
            <text class="station-name">{{ item.title }}</text>
            <text class="station-location">{{ item.adress }}</text>
            <view class="station-tags"><text class="tag">{{ item.category || '加油站' }}</text></view>
            <view class="station-price"><text class="price">¥{{ item.price || '7.5' }}/升</text><text class="commission">返¥{{ item.commission || '0.3' }}/升</text></view>
          </view>
        </view>
      </view>
      <view class="empty-tip" v-else>
        <text>暂无附近加油站，请尝试切换城市或重新定位</text>
        <text class="tip-sub">接入CPS平台后将显示真实商家</text>
      </view>
    </view>

    <view v-if="showCityPicker" class="city-modal" @click="showCityPicker = false">
      <view class="city-panel" @click.stop>
        <view class="city-header">
          <text class="city-title">选择城市</text><text class="close-btn" @click="showCityPicker = false">✕</text>
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
import { onShow } from '@dcloudio/uni-app'

const goBack = () => uni.navigateBack()
const showCityPicker = ref(false)
const currentCity = ref('杭州')
const locationLoading = ref(false)
const loading = ref(false)
const hasData = ref(false)
const latitude = ref('')
const longitude = ref('')

const TENCENT_MAP_KEY = 'AU6BZ-STG6Q-K2D5A-2TYTM-XLJTT-JWFFU'
const cities = ['杭州', '上海', '北京', '广州', '深圳', '成都', '重庆', '西安', '武汉', '南京']
const cityCoords = { '杭州': {lat:30.2741,lng:120.1551}, '上海':{lat:31.2304,lng:121.4737}, '北京':{lat:39.9042,lng:116.4074}, '广州':{lat:23.1291,lng:113.2644}, '深圳':{lat:22.5431,lng:114.0579}, '成都':{lat:30.5728,lng:104.0668}, '重庆':{lat:29.4316,lng:106.9123}, '西安':{lat:34.3416,lng:108.9398}, '武汉':{lat:30.5928,lng:114.3055}, '南京':{lat:32.0603,lng:118.7969} }

const getLocation = () => {
  locationLoading.value = true
  uni.getLocation({ type: 'gcj02', success: (res) => { latitude.value = res.latitude; longitude.value = res.longitude; locationLoading.value = false; hasData.value = true; searchNearbyStations(res.latitude, res.longitude) }, fail: () => { locationLoading.value = false; const c = cityCoords[currentCity.value]; if(c){ hasData.value = true; searchNearbyStations(c.lat, c.lng) } } })
}

const searchNearbyStations = (lat, lng) => {
  loading.value = true
  const url = `https://apis.map.qq.com/ws/place/v1/search?keyword=加油站&boundary=nearby(${lat},${lng},5000)&page_size=20&page_index=1&key=${TENCENT_MAP_KEY}`
  uni.request({ url, method: 'GET', success: (res) => { loading.value = false; if(res.data?.data?.length){ stations.value = res.data.data; hasData.value = true }else{ stations.value = []; hasData.value = false } }, fail: () => { loading.value = false; stations.value = []; hasData.value = false } })
}

const selectCity = (city) => { currentCity.value = city; showCityPicker.value = false; const c = cityCoords[city]; if(c){ hasData.value = true; searchNearbyStations(c.lat, c.lng) } }

const coupons = ref([{id:1,amount:10,minAmount:100,received:false},{id:2,amount:20,minAmount:200,received:false}])
const receiveCoupon = (item) => { if(!item.received){ item.received = true; uni.showToast({title:'优惠券已领取',icon:'success'}) } }
const stations = ref([])
const goToH5 = () => { uni.navigateTo({url:`/pages/webview/webview?url=${encodeURIComponent('https://www.didichuxing.com/oil/')}`}) }

onShow(() => { const c = cityCoords[currentCity.value]; if(c){ hasData.value = true; searchNearbyStations(c.lat, c.lng) } })
</script>

<style scoped>
.container{min-height:100vh;background:#f5f7fa}
.header{background:linear-gradient(135deg,#4ecdc4,#44a08d);padding:50rpx 30rpx 30rpx;border-radius:0 0 30rpx 30rpx;display:flex;align-items:center}
.back-btn{font-size:48rpx;color:#fff;margin-right:20rpx;font-weight:bold}
.page-title{font-size:36rpx;font-weight:bold;color:#fff;flex:1}
.city-select{display:flex;align-items:center;background:rgba(255,255,255,0.2);padding:10rpx 20rpx;border-radius:30rpx;color:#fff;font-size:26rpx}
.arrow{font-size:18rpx;margin-left:8rpx}
.location-tip{display:flex;align-items:center;background:#fff;margin:20rpx;padding:20rpx;border-radius:12rpx;box-shadow:0 2rpx 8rpx rgba(0,0,0,0.05)}
.location-icon{font-size:32rpx;margin-right:12rpx}
.location-text{flex:1;font-size:26rpx;color:#333}
.location-arrow{font-size:32rpx;color:#999}
.coupon-section{background:#fff;margin:0 20rpx 20rpx;border-radius:16rpx;padding:20rpx}
.section-title{font-size:28rpx;font-weight:bold;color:#333;margin-bottom:16rpx}
.section-title .count{font-size:24rpx;color:#999;font-weight:normal}
.coupon-scroll{white-space:nowrap}
.coupon-list{display:inline-flex;gap:16rpx}
.coupon-item{display:flex;align-items:center;width:280rpx;flex-shrink:0;background:linear-gradient(90deg,#4ecdc4,#44a08d);border-radius:12rpx;overflow:hidden}
.coupon-left{flex:1;padding:16rpx}
.coupon-price{display:block;font-size:36rpx;font-weight:bold;color:#fff}
.coupon-condition{font-size:20rpx;color:rgba(255,255,255,0.8)}
.coupon-right{background:rgba(255,255,255,0.2);padding:20rpx 16rpx}
.receive-text{font-size:22rpx;color:#fff}
.section{padding:20rpx}
.loading{text-align:center;padding:60rpx;color:#999}
.station-item{display:flex;align-items:center;background:#fff;border-radius:16rpx;padding:24rpx;margin-bottom:20rpx;box-shadow:0 4rpx 12rpx rgba(0,0,0,0.05)}
.station-icon{font-size:60rpx;margin-right:20rpx}
.station-info{flex:1}
.station-name{display:block;font-size:28rpx;font-weight:bold;color:#333}
.station-location{font-size:24rpx;color:#888;display:block;margin-top:6rpx}
.station-tags{display:flex;gap:8rpx;margin-top:8rpx}
.tag{font-size:20rpx;color:#4ecdc4;background:#e8f8f5;padding:4rpx 12rpx;border-radius:8rpx}
.station-price{display:flex;align-items:center;margin-top:10rpx}
.price{font-size:28rpx;font-weight:bold;color:#4ecdc4}
.commission{font-size:22rpx;color:#fff;background:#4ecdc4;padding:4rpx 12rpx;border-radius:20rpx;margin-left:12rpx}
.empty-tip{text-align:center;padding:80rpx 40rpx;color:#999;font-size:26rpx}
.tip-sub{display:block;margin-top:20rpx;font-size:24rpx;color:#bbb}
.city-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:flex;align-items:flex-end}
.city-panel{width:100%;background:#fff;border-radius:24rpx 24rpx 0 0;max-height:70vh}
.city-header{display:flex;justify-content:space-between;align-items:center;padding:30rpx;border-bottom:1rpx solid #eee}
.city-title{font-size:30rpx;font-weight:bold}
.close-btn{font-size:32rpx;color:#999}
.city-list{display:flex;flex-wrap:wrap;padding:20rpx;gap:16rpx}
.city-item{width:calc(25% - 12rpx);text-align:center;padding:20rpx 0;background:#f5f7fa;border-radius:12rpx;font-size:26rpx;color:#333}
.city-item.active{background:#4ecdc4;color:#fff}
</style>
