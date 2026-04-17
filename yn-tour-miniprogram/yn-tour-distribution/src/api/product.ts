// 商品相关API
import { get } from '../utils/request'

export interface Highlight {
  icon: string
  text: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  meals?: string
  tags?: string[]
}

export interface ProductInfo {
  _id: string
  name: string
  subtitle?: string
  description?: string
  images: string[]
  price: number
  originalPrice?: number
  duration?: string
  destinations?: string[]
  itinerary?: ItineraryDay[]
  feeInclude?: string[]
  feeExclude?: string[]
  highlights?: Highlight[]
  notices?: string[]
  commission?: { level1: number; level2: number }
  isPromotion?: boolean
  promotionPrice?: number
  promotionStart?: Date
  promotionEnd?: Date
  status: number
  sort?: number
  createdAt: Date
  updatedAt: Date
}

// 获取商品列表
export function getProductList(params: {
  page?: number
  limit?: number
  status?: number
}) {
  return get<{ list: ProductInfo[]; pagination: any }>('/product/list', params)
}

// 获取商品详情
export function getProductDetail(params: { productId: string }) {
  return get<ProductInfo>('/product/detail', params)
}

// 获取首页推荐商品
export function getRecommendProducts(params: { limit?: number }) {
  return get<ProductInfo[]>('/product/recommend', params)
}
