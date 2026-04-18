// 用户相关 API
import { get, post } from '../utils/request'
import { userState } from '../store/user'
import { useUserStore } from '../store/user'

export interface LoginParams {
  openid: string
  nickname: string
  avatar: string
  parentId?: string
  referrerId?: string
}

export interface UserInfo {
  _id: string
  openid: string
  nickname: string
  avatar: string
  isDistributor: boolean
  phone?: string
  selfOrderNum: number
  totalCommission: number
  availableCommission: number
  frozenCommission: number
  parentId?: string
}

// 登录响应（后端返回 { user, token }）
export interface LoginResponse {
  user: UserInfo
  token: string
}

/**
 * 微信小程序登录
 * 1. 调用 wx.login() 获取 code
 * 2. 传 code 到后端，后端用 code 换 openid
 * 3. 后端返回 userInfo，前端存储到全局状态
 */
export async function wxLoginAndBind(): Promise<UserInfo> {
  const userStore = useUserStore()
  
  // #ifdef MP-WEIXIN
  const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: resolve,
      fail: reject
    })
  })
  
  if (!loginRes.code) {
    throw new Error('微信登录失败，未获取到 code')
  }
  
  const res = await post<LoginResponse>('/user/wx-login', {
    code: loginRes.code,
    nickname: '微信用户',
    avatar: '',
    referrerId: userState.referrerId || undefined
  })
  // #endif
  
  // #ifndef MP-WEIXIN
  // 非小程序环境，用模拟 openid
  const mockOpenid = 'mock_openid_' + Date.now()
  const res = await post<LoginResponse>('/user/wx-login', {
    code: mockOpenid,
    nickname: '游客用户',
    avatar: '',
    referrerId: userState.referrerId || undefined
  })
  // #endif
  
  if (res.data) {
    userStore.setUser({
      userId: res.data.user._id,
      openid: res.data.user.openid,
      nickname: res.data.user.nickname,
      avatar: res.data.user.avatar,
      isDistributor: res.data.user.isDistributor,
      token: res.data.token
    })
  }
  
  return res.data?.user
}

// 获取用户信息
export function getUserInfo(params?: { openid?: string; userId?: string }) {
  return get<UserInfo>('/user/info', params)
}

// 获取当前登录用户信息（自动用全局 userId）
export function getCurrentUserInfo() {
  console.log('[DEBUG getCurrentUserInfo] userId from store:', userState.userId)
  return get<UserInfo>('/user/info', { userId: userState.userId })
}

// 成为分销商
export function becomeDistributor(data: { userId: string }) {
  return post('/user/become-distributor', data)
}

// 获取用户收益统计（279机制）
export function getUserEarnings(params: { userId: string }) {
  return get<{
    totalCommission: number
    availableCommission: number
    frozenCommission: number
    selfOrderNum: number
    directPushNum: number
    teamOrderNum: number
    groupBonus: number
    dividend: number
    signInReward: number
    visitReward: number
  }>('/user/earnings', params)
}

// 计算可提现金额
export function calculateWithdraw(params: { userId: string }) {
  return get<{
    totalAmount: number
    handlingFee: number
    actualAmount: number
  }>('/user/calculate-withdraw', params)
}

// 用户申请提现
export function applyWithdraw(data: {
  userId: string
  withdrawMethod: string
  accountInfo: any
  amount: number
}) {
  return post('/withdraw/apply', data)
}

// 获取用户提现记录
export function getWithdrawList(params: { userId: string; page?: number; limit?: number; status?: string }) {
  return get('/withdraw/list', params)
}

// 获取收益明细
export function getCommissionList(params: { 
  userId: string
  page?: number
  limit?: number 
}) {
  return get('/user/commission-list', params)
}

// 获取团队排行榜
export function getTeamRanking(params: { limit?: number; period?: 'month' | 'lastMonth' | 'all' }) {
  return get('/user/team-ranking', params)
}

// 每日签到
export function signIn(data: { userId: string }) {
  return post('/user/sign-in', data)
}

// 记录访问（有效访问奖）
export function recordVisit(data: {
  userId?: string
  visitorId: string
  targetType: 'product' | 'page' | 'home'
  targetId?: string
  referrerId?: string
  ip?: string
  userAgent?: string
}) {
  return post('/user/record-visit', data)
}

// 获取我的团队信息
export function getMyTeam(params: { userId: string }) {
  return get<{
    teamMembers: any[]
    totalCount: number
    validCount: number
    teamOrderCount: number
  }>('/user/my-team', params)
}

// ========== 分享相关 API ==========

// 获取用户专属分享码（用于生成海报/链接）
export function getShareCode(params: { userId: string }) {
  return get<{
    shareCode: string      // 用于拼接 URL
    qrCodeUrl: string     // 二维码图片 URL
    posterUrl: string     // 海报图片 URL（带小程序码）
  }>('/user/share-code', params)
}

// 生成分享海报（后端生成带小程序码的海报）
export function generateSharePoster(params: { userId: string }) {
  return get<{
    posterUrl: string
    posterTempPath?: string  // 本地临时路径
  }>('/user/generate-poster', params)
}

// ========== 手机号登录相关 API ==========

export interface SendSmsCodeResponse {
  expiresIn: number  // 验证码有效期（秒）
}

// 发送短信验证码
export function sendSmsCode(phone: string) {
  return post<SendSmsCodeResponse>('/auth/send-sms-code', { phone })
}

export interface PhoneLoginResponse {
  _id: string
  openid: string
  nickname: string
  avatar: string
  phone: string
  isDistributor: boolean
}

// 手机号+验证码登录
export interface PhoneLoginResult {
  user: PhoneLoginResponse
  token: string
}

export function phoneLogin(params: {
  phone: string
  code: string
  referrerId?: string
}) {
  return post<PhoneLoginResult>('/auth/phone-login', params)
}

// 绑定手机号（已登录用户）
export function bindPhone(params: {
  userId: string
  phone: string
  code: string
}) {
  return post<PhoneLoginResponse>('/auth/bind-phone', params)
}

// ========== 订单导入相关 API ==========

export interface ImportOrderStatus {
  _id: string
  status: 'pending' | 'approved' | 'rejected'
  importOrderNo: string
  importSource: string
  reviewRemark?: string
  createdAt: string
  reviewedAt?: string
}

// 提交订单导入申请
export function submitImportOrder(params: {
  userId?: string
  phone: string
  nickname?: string
  importOrderNo: string
  importSource: string
}) {
  return post('/import/submit', params)
}

// 查询订单导入审核状态
export function getImportStatus(params: { userId?: string; phone: string }) {
  return get<ImportOrderStatus>('/import/status', params)
}
