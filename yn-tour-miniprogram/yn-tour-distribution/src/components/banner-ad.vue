<!-- 微信流量主广告组件 - Banner -->
<template>
  <view class="ad-container">
    <ad 
      v-if="adUnitId" 
      :unit-id="adUnitId" 
      @load="onLoad" 
      @error="onError"
      @close="onClose"
    />
    <view v-else class="ad-placeholder">
      <text>广告加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 替换为你的广告位ID（需要在微信小程序后台申请）
const adUnitId = ref('adunit-your-banner-id')

const onLoad = () => {
  console.log('Banner广告加载成功')
}

const onError = (err) => {
  console.log('Banner广告加载失败', err)
}

const onClose = () => {
  console.log('Banner广告关闭')
}
</script>

<style scoped>
.ad-container {
  width: 100%;
  display: flex;
  justify-content: center;
  background: #f5f5f5;
}
.ad-placeholder {
  padding: 20rpx;
  text-align: center;
  color: #999;
  font-size: 24rpx;
}
</style>
