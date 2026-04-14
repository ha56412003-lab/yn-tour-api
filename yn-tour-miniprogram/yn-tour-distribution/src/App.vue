<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore, userState } from './store/user'
import { post } from './utils/request'

// 定义全局用户状态（跨页面共享）
onLaunch((options) => {
  console.log('App Launch', JSON.stringify(options))
  
  const userStore = useUserStore()
  
  // 1. 解析分享链接带来的 referrerId
  // 微信小程序通过 onShareAppMessage 分享时，参数在 query 中
  // 也处理通过 URL scheme 打开的情况
  try {
    if (options.query && options.query.referrerId) {
      userStore.setReferrer(options.query.referrerId)
      console.log('已设置 referrerId:', options.query.referrerId)
    }
    
    // 微信扫二维码打开的情况，scene 参数需要 URL decode
    if (options.query && options.query.scene) {
      const scene = decodeURIComponent(options.query.scene)
      const params = new URLSearchParams(scene)
      const referrerId = params.get('referrerId')
      if (referrerId) {
        userStore.setReferrer(referrerId)
        console.log('已设置 referrerId from scene:', referrerId)
      }
    }
  } catch (e) {
    console.error('解析 referrerId 失败:', e)
  }
  
  // 2. 如果已登录，尝试自动登录（刷新 token 等）
  if (userStore.state.isLoggedIn && userStore.state.openid) {
    autoLogin(userStore.state.openid).catch(err => {
      console.error('自动登录失败:', err)
    })
  }
})

onShow((options) => {
  console.log('App Show', JSON.stringify(options))
  
  // 每次 show 都检查一次 referrerId（用户可能通过分享再次打开）
  const userStore = useUserStore()
  if (options.query) {
    if (options.query.referrerId && options.query.referrerId !== userStore.state.referrerId) {
      userStore.setReferrer(options.query.referrerId)
    }
  }
})

onHide(() => {
  console.log('App Hide')
})

// 自动登录（用 openid 注册/登录）
async function autoLogin(openid: string) {
  try {
    const res = await post<any>('/user/login', {
      openid,
      nickname: '微信用户',
      avatar: '',
      referrerId: userState.referrerId || undefined
    })
    if (res.data) {
      const userStore = useUserStore()
      userStore.setUser({
        userId: res.data._id,
        openid: res.data.openid,
        nickname: res.data.nickname,
        avatar: res.data.avatar,
        isDistributor: res.data.isDistributor
      })
    }
  } catch (e) {
    console.error('autoLogin error:', e)
  }
}


</script>

<style>
page {
  background: #f5f5f5;
  font-size: 28rpx;
  color: #333;
}

view, text, button {
  box-sizing: border-box;
}

.container {
  padding: 30rpx;
}

.btn-primary {
  background: #2E8B57;
  color: #fff;
}

.btn-warning {
  background: #FF6600;
  color: #fff;
}
</style>
