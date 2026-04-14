// 商品相关API
import { get } from '../utils/request'

export interface ProductInfo {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  coverImage: string
  status: number
  tags?: string[]
  highlights?: string[]
  itinerary?: any[]
  includedItems?: string[]
  excludedItems?: string[]
  createdAt: Date
  updatedAt: Date
}

// 获取商品列表
export function getProductList(params: { 
  page?: number; 
  limit?: number; 
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
