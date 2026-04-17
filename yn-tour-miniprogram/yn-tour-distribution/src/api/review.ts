import { request } from '../utils/request'

export interface Review {
  _id?: string
  image: string
  avatar: string
  nickname: string
  rating: number
  content: string
  show?: boolean
  sort?: number
  createdAt?: string
  updatedAt?: string
}

export function getReviewList() {
  return request<Review[]>({
    url: '/review/public',
    method: 'GET',
  })
}

export function getReviewListAdmin(params?: { page?: number; limit?: number; show?: boolean }) {
  return request<{ list: Review[]; total: number; page: number; limit: number }>({
    url: '/review/list',
    method: 'GET',
    params,
  })
}

export function createReview(data: Partial<Review>) {
  return request<Review>({
    url: '/review/create',
    method: 'POST',
    data,
  })
}

export function updateReview(data: Partial<Review> & { reviewId: string }) {
  return request<Review>({
    url: '/review/update',
    method: 'POST',
    data,
  })
}

export function deleteReview(reviewId: string) {
  return request({
    url: '/review/delete',
    method: 'POST',
    data: { reviewId },
  })
}
