// 全局用户状态管理
import { reactive, readonly } from 'vue'

interface UserState {
  isLoggedIn: boolean
  userId: string
  openid: string
  nickname: string
  avatar: string
  phone: string
  referrerId: string  // 从分享链接进入时的上级ID
  isDistributor: boolean
  token: string  // JWT token，用于需要登录态的 API 请求
}

const STATE_KEY = 'yn_user_state'

// 从本地存储恢复状态
const loadState = (): UserState => {
  try {
    const saved = uni.getStorageSync(STATE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return {
    isLoggedIn: false,
    userId: '',
    openid: '',
    nickname: '',
    avatar: '',
    phone: '',
    referrerId: '',
    isDistributor: false,
    token: ''
  }
}

// 响应式用户状态
const state = reactive<UserState>(loadState())

// 保存到本地
const saveState = () => {
  try {
    uni.setStorageSync(STATE_KEY, JSON.stringify(state))
  } catch (e) {}
}

// 设置登录状态
const setUser = (user: Partial<UserState>) => {
  console.log('[DEBUG setUser] called, userId:', user.userId, 'token:', user.token ? 'present' : 'none')
  // 直接赋值每个字段，避免 Object.assign 在 readonly proxy 下的响应性问题
  if (user.userId !== undefined) state.userId = user.userId
  if (user.openid !== undefined) state.openid = user.openid
  if (user.nickname !== undefined) state.nickname = user.nickname
  if (user.avatar !== undefined) state.avatar = user.avatar
  if (user.phone !== undefined) state.phone = user.phone
  if (user.isDistributor !== undefined) state.isDistributor = user.isDistributor
  if (user.referrerId !== undefined) state.referrerId = user.referrerId
  if (user.token !== undefined) state.token = user.token
  if (user.userId) state.isLoggedIn = true
  console.log('[DEBUG setUser] after, userId:', state.userId, 'token:', state.token ? 'present' : 'none')
  saveState()
}

// 设置 referrerId（从分享链接进入时）
const setReferrer = (referrerId: string) => {
  state.referrerId = referrerId
  saveState()
}

// 设置分销商状态
const setDistributor = (isDistributor: boolean) => {
  state.isDistributor = isDistributor
  saveState()
}

// 登出
const logout = () => {
  state.isLoggedIn = false
  state.userId = ''
  state.openid = ''
  state.nickname = ''
  state.avatar = ''
  state.phone = ''
  state.isDistributor = false
  state.token = ''
  saveState()
}

// 微信登录（获取 openid）
const wxLogin = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error('未获取到 code'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
    // #endif
    // #ifndef MP-WEIXIN
    // 非小程序环境，使用模拟 code
    resolve('mock_code_' + Date.now())
    // #endif
  })
}

export const useUserStore = () => ({
  state: readonly(state),
  setUser,
  setReferrer,
  setDistributor,
  logout,
  wxLogin
})

export { state as userState }
