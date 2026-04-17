import { request } from '../utils/request'

export interface HomeConfig {
  _id?: string
  bannerImage: string
  linkedProductId?: string
  linkedProduct?: {
    _id: string
    name: string
    subtitle?: string
    price: number
    originalPrice?: number
    promotionPrice?: number
    isPromotion?: boolean
    images?: string[]
    highlights?: { icon: string; text: string }[]
  }
}

export function getHomeConfig() {
  return request<HomeConfig | null>({
    url: '/homeConfig/get',
    method: 'GET',
  })
}

export function getHomeConfigProducts() {
  return request<HomeConfig['linkedProduct'][]>({
    url: '/homeConfig/products',
    method: 'GET',
  })
}
