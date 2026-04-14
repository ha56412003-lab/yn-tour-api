<template>
  <view class="container">
    <view class="header"><view class="back-btn" @click="goBack">‹</view><text class="page-title">电影票</text><view class="city-select" @click="showCityPicker = true"><text>{{ currentCity }}</text><text class="arrow">▼</text></view></view>
    <view class="location-tip" @click="getLocation"><text class="location-icon">📍</text><text class="location-text">{{ locationLoading ? '正在定位...' : '点击获取附近影院' }}</text><text class="location-arrow">›</text></view>
    <view class="coupon-section" v-if="hasData"><view class="section-title">🎬 观影红包</view><scroll-view class="coupon-scroll" scroll-x><view class="coupon-list"><view class="coupon-item" v-for="item in coupons" :key="item.id" @click="receiveCoupon(item)"><view class="coupon-left"><text class="coupon-price">¥{{ item.amount }}</text><text class="coupon-condition">满{{ item.minAmount }}可用</text></view><view class="coupon-right"><text class="receive-text">{{ item.received ? '已领取' : '立即领取' }}</text></view></view></view></scroll-view></view>
    <view class="section"><view class="section-title">🎥 热映电影 <text class="count">({{ movies.length }})</text></view><view class="loading" v-if="loading"><text>正在搜索...</text></view><view class="movie-list" v-else-if="hasData"><view class="movie-item" v-for="item in movies" :key="item.id" @click="goToH5(item)"><image class="movie-img" :src="item.img_url || 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p480747492.jpg'" mode="aspectFill" /><view class="movie-info"><text class="movie-name">{{ item.title }}</text><text class="movie-score">{{ item.score || '8.5' }}分</text><view class="movie-tags"><text class="tag">{{ item.category || '热映' }}</text></view><view class="movie-price"><text class="price">¥{{ Math.floor(Math.random() * 20 + 30) }}</text><text class="commission">返¥{{ Math.floor(Math.random() * 3 + 2) }}</text></view></view></view></view><view class="empty-tip" v-else><text>暂无热映电影</text><text class="tip-sub">接入CPS平台后将显示真实商家</text></view></view>
    <view v-if="showCityPicker" class="city-modal" @click="showCityPicker = false"><view class="city-panel" @click.stop><view class="city-header"><text class="city-title">选择城市</text><text class="close-btn" @click="showCityPicker = false">✕</text></view><view class="city-list"><view class="city-item" v-for="item in cities" :key="item" :class="{ active: currentCity === item }" @click="selectCity(item)">{{ item }}</view></view></view></view>
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
const cities = ['杭州', '上海', '北京', '广州', '深圳', '成都', '重庆']
const cityCoords = { '杭州': {lat:30.2741,lng:120.1551}, '上海':{lat:31.2304,lng:121.4737}, '北京':{lat:39.9042,lng:116.4074} }
const getLocation = () => { locationLoading.value = true; uni.getLocation({ type: 'gcj02', success: (res) => { locationLoading.value = false; hasData.value = true; searchNearbyMovies(res.latitude, res.longitude) }, fail: () => { locationLoading.value = false; const c = cityCoords[currentCity.value]; if(c){ hasData.value = true; searchNearbyMovies(c.lat, c.lng) } } }) }
const searchNearbyMovies = (lat, lng) => { loading.value = true; setTimeout(() => { loading.value = false; if(lat && lng){ movies.value = [{id:1,title:'流浪地球3',score:9.2,category:'科幻/冒险',img_url:'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p480747492.jpg'},{id:2,title:'复仇者联盟5',score:8.8,category:'动作/科幻',img_url:'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p480747492.jpg'}]; hasData.value = true }else{ movies.value = []; hasData.value = false } }, 500) }
const selectCity = (city) => { currentCity.value = city; showCityPicker.value = false; const c = cityCoords[city]; if(c){ hasData.value = true; searchNearbyMovies(c.lat, c.lng) } }
const coupons = ref([{id:1,amount:10,minAmount:35,received:false},{id:2,amount:20,minAmount:60,received:false}])
const receiveCoupon = (item) => { if(!item.received){ item.received = true; uni.showToast({title:'红包已领取',icon:'success'}) } }
const movies = ref([])
const goToH5 = () => { uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent('https://maoyan.com/')}` }) }
onShow(() => { const c = cityCoords[currentCity.value]; if(c){ hasData.value = true; searchNearbyMovies(c.lat, c.lng) } })
</script>

<style scoped>
.container{min-height:100vh;background:#f5f7fa}
.header{background:linear-gradient(135deg,#667eea,#764ba2);padding:50rpx 30rpx 30rpx;border-radius:0 0 30rpx 30rpx;display:flex;align-items:center}
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
.coupon-item{display:flex;align-items:center;width:260rpx;flex-shrink:0;background:linear-gradient(90deg,#667eea,#764ba2);border-radius:12rpx;overflow:hidden}
.coupon-left{flex:1;padding:16rpx}
.coupon-price{display:block;font-size:36rpx;font-weight:bold;color:#fff}
.coupon-condition{font-size:20rpx;color:rgba(255,255,255,0.8)}
.coupon-right{background:rgba(255,255,255,0.2);padding:20rpx 16rpx}
.receive-text{font-size:22rpx;color:#fff}
.section{padding:20rpx}
.loading{text-align:center;padding:60rpx;color:#999}
.movie-list{display:flex;flex-wrap:wrap;justify-content:space-between}
.movie-item{width:48%;background:#fff;border-radius:16rpx;padding:16rpx;margin-bottom:20rpx}
.movie-img{width:100%;height:280rpx;border-radius:12rpx}
.movie-info{margin-top:12rpx}
.movie-name{font-size:26rpx;font-weight:bold;color:#333;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.movie-score{font-size:22rpx;color:#ff9500;display:block;margin:6rpx 0}
.movie-tags{display:flex;margin-bottom:8rpx}
.tag{font-size:18rpx;color:#667eea;background:#e8ecff;padding:2rpx 8rpx;border-radius:6rpx}
.movie-price{display:flex;align-items:center}
.price{font-size:28rpx;font-weight:bold;color:#667eea}
.commission{font-size:20rpx;color:#fff;background:#667eea;padding:2rpx 8rpx;border-radius:16rpx;margin-left:8rpx}
.empty-tip{text-align:center;padding:80rpx 40rpx;color:#999;font-size:26rpx}
.tip-sub{display:block;margin-top:20rpx;font-size:24rpx;color:#bbb}
.city-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;display:flex;align-items:flex-end}
.city-panel{width:100%;background:#fff;border-radius:24rpx 24rpx 0 0;max-height:70vh}
.city-header{display:flex;justify-content:space-between;align-items:center;padding:30rpx;border-bottom:1rpx solid #eee}
.city-title{font-size:30rpx;font-weight:bold}
.close-btn{font-size:32rpx;color:#999}
.city-list{display:flex;flex-wrap:wrap;padding:20rpx;gap:16rpx}
.city-item{width:calc(25% - 12rpx);text-align:center;padding:20rpx 0;background:#f5f7fa;border-radius:12rpx;font-size:26rpx;color:#333}
.city-item.active{background:#667eea;color:#fff}
</style>
