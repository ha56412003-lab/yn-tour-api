<template>
  <view class="container">
    <web-view :src="url"></web-view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const url = ref('')

onLoad((options) => {
  if (options.url) {
    url.value = decodeURIComponent(options.url)
  }
})
</script>

<style scoped>
.container { width: 100%; height: 100vh; }
</style>
