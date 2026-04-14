<!-- 激励视频广告组件 -->
<template>
  <view class="reward-ad">
    <button 
      class="reward-btn" 
      @click="showRewardAd"
      :style="{ background: btnColor }"
    >
      <text class="icon">{{ btnIcon }}</text>
      <text class="text">{{ btnText }}</text>
    </button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  adUnitId: {
    type: String,
    default: 'adunit-your-reward-id'
  },
  btnText: {
    type: String,
    default: '看视频领奖励'
  },
  btnIcon: {
    type: String,
    default: '🎬'
  },
  btnColor: {
    type: String,
    default: 'linear-gradient(135deg, #ff6b6b, #ff8e53)'
  }
})

let videoAd = null

const showRewardAd = () => {
  // 创建激励视频广告实例
  if (!videoAd) {
    videoAd = tt.createRewardedVideoAd({
      adUnitId: props.adUnitId
    })
    
    videoAd.onLoad(() => {
      console.log('激励视频加载成功')
    })
    
    videoAd.onError((err) => {
      console.log('激励视频加载失败', err)
      uni.showToast({
        title: '广告加载失败',
        icon: 'none'
      })
    })
    
    videoAd.onClose((res) => {
      if (res.isEnded) {
        // 观看完整视频，发放奖励
        uni.showToast({
          title: '奖励已发放！',
          icon: 'success'
        })
        // 触发奖励回调
        emit('reward')
      } else {
        uni.showToast({
          title: '请看完视频',
          icon: 'none'
        })
      }
    })
  }
  
  // 显示广告
  videoAd.show().catch(() => {
    videoAd.load().then(() => videoAd.show())
  })
}

const emit = defineEmits(['reward'])
</script>

<style scoped>
.reward-ad {
  padding: 20rpx;
}
.reward-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 40rpx;
  border-radius: 50rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
.reward-btn .icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}
.reward-btn .text {
  
}
</style>
