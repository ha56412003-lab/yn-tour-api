// 全局请求封装 - 自动携带用户身份
import { userState } from '../store/user'

// 根据环境切换 API 地址
const getBaseUrl = (): string => {
  // #ifdef MP-WEIXIN
  // 小程序环境使用局域网 IP（开发时手机要连同一个 WiFi）
  return 'http://192.168.10.14:3000/api'
  // #endif
  
  // #ifndef MP-WEIXIN
  // H5 / 其他环境
  return 'http://localhost:3000/api'
  // #endif
}

export const BASE_URL = getBaseUrl()

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  /** 不自动附带 userId */
  noAuth?: boolean
}

interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

// 发起请求
export function request<T = any>(options: RequestOptions): Promise<ResponseData<T>> {
  return new Promise((resolve, reject) => {
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    // 自动附带 userId（除登录课外）
    if (!options.noAuth && userState.userId) {
      headers['X-User-Id'] = userState.userId
    }
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      success: (res: any) => {
        const response = res.data as ResponseData<T>
        if (response.code === 200) {
          resolve(response)
        } else {
          if (response.code === 401) {
            // 未登录，跳转登录
            uni.showToast({ title: '请先登录', icon: 'none' })
          } else {
            uni.showToast({
              title: response.message || '请求失败',
              icon: 'none'
            })
          }
          reject(new Error(response.message))
        }
      },
      fail: (err: any) => {
        console.error('请求失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET 请求
export function get<T = any>(url: string, data?: any): Promise<ResponseData<T>> {
  return request<T>({ url, method: 'GET', data })
}

// POST 请求
export function post<T = any>(url: string, data?: any): Promise<ResponseData<T>> {
  return request<T>({ url, method: 'POST', data })
}
