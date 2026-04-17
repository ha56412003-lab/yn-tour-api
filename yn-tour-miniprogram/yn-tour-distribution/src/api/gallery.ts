// 产品素材/花絮API
import { get } from '../utils/request'

export interface GalleryItem {
  _id: string
  category: 'scene' | 'food' | 'hotel' | 'experience'
  title: string
  location: string
  scene: string
  url: string
  sort: number
  status: number
}

export type GalleryByCategory = {
  scene: GalleryItem[]
  food: GalleryItem[]
  hotel: GalleryItem[]
  experience: GalleryItem[]
}

// 按分类获取素材
export function getGalleryByCategory() {
  return get<GalleryByCategory>('/gallery/by-category')
}

// 获取所有素材
export function getGalleryAll(category?: string) {
  return get<GalleryItem[]>('/gallery/all', category ? { category } : {})
}
