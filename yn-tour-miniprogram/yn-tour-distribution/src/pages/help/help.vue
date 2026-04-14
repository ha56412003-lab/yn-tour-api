<template>
  <view class="container">
    <!-- 顶部Header -->
    <view class="header">
      <text class="page-title">帮助文档</text>
    </view>

    <!-- 内容区 -->
    <scroll-view class="content" scroll-y>
      <!-- 分佣说明 -->
      <view v-if="activeTab === 0" class="help-section">
        <view class="section-header">
          <text class="section-icon">💰</text>
          <text class="section-title">分佣机制</text>
        </view>
        <view class="feature-cards">
          <view class="feature-card">
            <view class="feature-num">1</view>
            <view class="feature-content">
              <text class="feature-title">分享赚钱</text>
              <text class="feature-desc">每成功分享一次可获得20元奖励</text>
            </view>
          </view>
          <view class="feature-card">
            <view class="feature-num">2</view>
            <view class="feature-content">
              <text class="feature-title">推广分佣</text>
              <text class="feature-desc">推荐用户下单可获得60%佣金</text>
            </view>
          </view>
          <view class="feature-card">
            <view class="feature-num">3</view>
            <view class="feature-content">
              <text class="feature-title">团队收益</text>
              <text class="feature-desc">团队成员下单可获得额外团队奖励</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 产品详情 -->
      <view v-if="activeTab === 1" class="help-section">
        <view class="section-header">
          <text class="section-icon">🏔️</text>
          <text class="section-title">云南6天5晚轻奢游</text>
        </View>
        <view class="trip-timeline">
          <view class="timeline-item" v-for="(item, index) in tripInfo" :key="index">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-title">{{ item.title }}</text>
              <text class="timeline-desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 产品花絮 -->
      <view v-if="activeTab === 2" class="help-section">
        <view class="section-header">
          <text class="section-icon">📸</text>
          <text class="section-title">精彩瞬间</text>
        </view>
        <view class="gallery-grid">
          <image class="gallery-img" v-for="i in 6" :key="i" :src="`/static/demo${i}.png`" mode="aspectFill" />
        </view>
      </view>
    </scroll-view>

    <!-- 底部Tab -->
    <view class="bottom-tabs">
      <view class="tab-item" :class="{ active: activeTab === 0 }" @click="activeTab = 0">
        <view class="tab-icon-wrap"><text class="tab-icon">💰</text></view>
        <text class="tab-text">分佣说明</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 1 }" @click="activeTab = 1">
        <view class="tab-icon-wrap"><text class="tab-icon">🏔️</text></view>
        <text class="tab-text">产品详情</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 2 }" @click="activeTab = 2">
        <view class="tab-icon-wrap"><text class="tab-icon">📸</text></view>
        <text class="tab-text">产品花絮</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref(0)

const tripInfo = [
  { title: 'Day1 昆明接机', desc: '专车接机，入住酒店' },
  { title: 'Day2 石林景区', desc: '游览喀斯特奇观' },
  { title: 'Day3 大理古城', desc: '洱海骑行+古城夜市' },
  { title: 'Day4 丽江古城', desc: '玉龙雪山索道' },
  { title: 'Day5 泸沽湖', desc: '摩梭族家访' },
  { title: 'Day6 返程', desc: '送机/站，结束行程' },
]
</script>

<style scoped>
.container { display: flex; flex-direction: column; height: 100vh; background: #f0f2f5; }

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50rpx 30rpx 40rpx;
  border-radius: 0 0 50rpx 50rpx;
}
.page-title { font-size: 40rpx; font-weight: bold; color: #fff; }

/* Content */
.content { flex: 1; padding: 30rpx; padding-bottom: 160rpx; }

.help-section { background: #fff; border-radius: 24rpx; padding: 30rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06); }

.section-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 30rpx; padding-bottom: 24rpx; border-bottom: 2rpx solid #f0f0f0; }
.section-icon { font-size: 40rpx; }
.section-title { font-size: 34rpx; font-weight: bold; color: #333; }

/* 特性卡片 */
.feature-cards { display: flex; flex-direction: column; gap: 20rpx; }
.feature-card { display: flex; align-items: flex-start; padding: 24rpx; background: linear-gradient(135deg, #f8f9ff, #fff); border-radius: 16rpx; border: 1rpx solid #e8eaff; }
.feature-num {
  width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 26rpx; font-weight: bold;
  border-radius: 50%; margin-right: 20rpx; flex-shrink: 0;
}
.feature-content { flex: 1; }
.feature-title { display: block; font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.feature-desc { font-size: 26rpx; color: #666; line-height: 1.6; }

/* 时间线 */
.trip-timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; padding-bottom: 30rpx; position: relative; }
.timeline-item:not(:last-child)::after {
  content: ''; position: absolute; left: 16rpx; top: 36rpx; bottom: 0; width: 2rpx; background: #e0e0e0;
}
.timeline-dot {
  width: 32rpx; height: 32rpx; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%;
  margin-right: 24rpx; flex-shrink: 0; margin-top: 4rpx;
}
.timeline-content { flex: 1; }
.timeline-title { display: block; font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 6rpx; }
.timeline-desc { font-size: 24rpx; color: #888; }

/* 图库 */
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.gallery-img { width: 100%; height: 180rpx; border-radius: 12rpx; background: #eee; }

/* 底部Tab */
.bottom-tabs {
  position: fixed; bottom: 0; left: 0; right: 0; display: flex; background: #fff;
  padding: 16rpx 0; padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee; box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
}
.tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx; }
.tab-icon-wrap { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 16rpx; }
.tab-item.active .tab-icon-wrap { background: linear-gradient(135deg, #667eea, #764ba2); }
.tab-item.active .tab-text { color: #667eea; font-weight: bold; }
.tab-icon { font-size: 32rpx; }
.tab-text { font-size: 22rpx; color: #999; }
</style>
