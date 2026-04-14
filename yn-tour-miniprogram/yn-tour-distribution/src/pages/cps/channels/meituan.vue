<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="page-title">美团外卖</text>
      <view class="city-select" @click="showCityPicker = true"><text>{{ currentCity }}</text><text class="arrow">▼</text></view>
    </view>
    <view class="location-tip" @click="getLocation"><text class="location-icon">📍</text><text class="location-text">{{ locationLoading ? '正在定位...' : '点击定位获取附近商家' }}</text><text class="location-arrow">›</text></view>
    <view class="coupon-section" v-if="hasData">
      <view class="section-title">🧧 外卖红包</view>
      <scroll-view class="coupon-scroll" scroll-x>
        <view class="coupon-list">
          <view class="coupon-item" v-for="item in coupons" :key="item.id" @click="receiveCoupon(item)">
            <view class="coupon-left"><text class="coupon-price">¥{{ item.amount }}</text><text class="coupon-condition">满{{ item.minAmount }}可用</text></view>
            <view class="coupon-right"><text class="receive-text">{{ item.received ? '已领取' : '立即领取' }}</text></view>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="section">
      <view class="section-title">🍔 附近热门商家 <text class="count">({{ shops.length }})</text></view>
      <view class="loading" v-if="loading"><text>正在搜索...</text></view>
      <view class="shop-list" v-else-if="hasData">
        <view class="shop-item" v-for="item in shops" :key="item.id" @click="goToMiniProgram()">
          <image class="shop-img" :src="item.img_url || '/static/avatar.png'" mode="aspectFill" />
          <view class="shop-info"><text class="shop-name">{{ item.title }}</text><text class="shop-desc">{{ item.adress }}</text><view class="shop-tags" v-if="item.category"><text class="tag">{{ item.category }}</text></view><view class="shop-bottom"><text class="commission">返¥{{ Math.floor(Math.random() * 3 + 1) }}</text><text class="sales">月销{{ Math.floor(Math.random() * 5000 + 1000) }}+</text></view></view>
        </view>
      </view>
      <view class="empty-tip" v-else><text>暂无附近商家</text><text class="tip-sub">接入CPS平台后将显示真实商家</text></view>
    </view>
    <view v-if="showCityPicker" class="city-modal" @click="showCityPicker = false">
      <view class="city-panel" @click.stop>
        <view class="city-header"><text class="city-title">选择城市</text><text class="close-btn" @click="showCityPicker = false">✕</text></view>
        <view class="city-list"><view class="city-item" v-for="item in cities" :key="item" :class="{ active: currentCity === item }" @click="selectCity(item)">{{ item }}</view></view>
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
const TENCENT_MAP_KEY = 'AU6BZ-STG6Q-K2D5A-2TYTM-XLJTT-JWFFU'
const cities = ['杭州', '上海', '北京', '广州', '深圳', '成都', '重庆', '武汉', '南京', '西安']
const cityCoords = { '杭州': {lat:30.2741,lng:120.1551}, '上海':{lat:31.2304,lng:121.4737}, '北京':{lat:39.9042,lng:116.4074} }
const getLocation = () => { locationLoading.value = true; uni.getLocation({ type: 'gcj02', success: (res) => { locationLoading.value = false; hasData.value = true; searchNearbyShops(res.latitude, res.longitude) }, fail: () => { locationLoading.value = false; const c = cityCoords[currentCity.value]; if(c){ hasData.value = true; searchNearbyShops(c.lat, c.lng) } } }) }
const searchNearbyShops = (lat, lng) => { loading.value = true; const url = `https://apis.map.qq.com/ws/place/v1/search?keyword=美食&boundary=nearby(${lat},${lng},3000)&page_size=20&page_index=1&key=${TENCENT_MAP_KEY}`; uni.request({ url, method: 'GET', success: (res) => { loading.value = false; if(res.data?.data?.length){ shops.value = res.data.data; hasData.value = true }else{ shops.value = []; hasData.value = false } }, fail: () => { loading.value = false; shops.value = []; hasData.value = false } }) }
const selectCity = (city) => { currentCity.value = city; showCityPicker.value = false; const c = cityCoords[city]; if(c){ hasData.value = true; searchNearbyShops(c.lat, c.lng) } }
const coupons = ref([{id:1,amount:6,minAmount:30,received:false},{id:2,amount:12,minAmount:50,received:false}])
const receiveCoupon = (item) => { if(!item.received){ item.received = true; uni.showToast({title:'红包已领取',icon:'success'}) } }
const shops = ref([])
const goToMiniProgram = () => { uni.navigateToMiniProgram({ appId: 'wxid', path: 'pages/index/index', fail: () => uni.showToast({title:'请先更新微信',icon:'none'}) }) }
onShow(() => { const c = cityCoords[currentCity.value]; if(c){ hasData.value = true; searchNearbyShops(c.lat, c.lng) } })
</script>

<style scoped>
.container{min-height:100vh;background:#f5f7fa}
.header{background:linear-gradient(135deg,#ffd700,#ff9500);padding:50rpx 30rpx 30rpx;border-radius:0 0 30rpx 30rpx;display:flex;align-items:center}
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
.section-title .count{font-size:24rpx;color:#999;font-weight:normal}
.coupon-scroll{white-space:nowrap}
.coupon-list{display:inline-flex;gap:16rpx}
.coupon-item{display:flex;align-items:center;width:260rpx;flex-shrink:0;background:linear-gradient(90deg,#ffd700,#ff9500);border-radius:12rpx;overflow:hidden}
.coupon-left{flex:1;padding:16rpx}
.coupon-price{display:block;font-size:36rpx;font-weight:bold;color:#fff}
.coupon-condition{font-size:20rpx;color:rgba(255,255,255,0.8)}
.coupon-right{background:rgba(255,255,255,0.2);padding:20rpx 16rpx}
.receive-text{font-size:22rpx;color:#fff}
.section{padding:20rpx}
.loading{text-align:center;padding:60rpx;color:#999}
.shop-item{display:flex;align-items:center;background:#fff;border-radius:16rpx;padding:20rpx;margin-bottom:20rpx}
.shop-img{width:140rpx;height:140rpx;border-radius:12rpx;flex-shrink:0;background:#eee}
.shop-info{flex:1;margin-left:20rpx}
.shop-name{font-size:28rpx;font-weight:bold;color:#333;display:block}
.shop-desc{font-size:24rpx;color:#888;display:block;margin-top:6rpx}
.shop-tags{display:flex;gap:8rpx;margin-top:8rpx}
.tag{font-size:20rpx;color:#ffd700;background:#fff9e6;padding:4rpx 12rpx;border-radius:8rpx}
.shop-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:10rpx}
.commission{font-size:24rpx;color:#ff6b6b;font-weight:bold}
.sales{font-size:22rpx;color:#888}
.empty-tip{text-align:center;padding:80rpx 40rpx;color:#999;font-size:26rpx}
.tip-sub{display:block;margin-top:20rpx;font-size:24rpx;color:#bbb}
.city-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:flex;align-items:flex-end}
.city-panel{width:100%;background:#fff;border-radius:24rpx 24rpx 0 0;max-height:70vh}
.city-header{display:flex;justify-content:space-between;align-items:center;padding:30rpx;border-bottom:1rpx solid #eee}
.city-title{font-size:30rpx;font-weight:bold}
.close-btn{font-size:32rpx;color:#999}
.city-list{display:flex;flex-wrap:wrap;padding:20rpx;gap:16rpx}
.city-item{width:calc(25% - 12rpx);text-align:center;padding:20rpx 0;background:#f5f7fa;border-radius:12rpx;font-size:26rpx;color:#333}
.city-item.active{background:#ffd700;color:#fff}
</style>
