// 订单相关API
import { get, post } from '../utils/request'

export interface Traveler {
  name: string
  phone: string
  idCard: string
}

export interface CreateOrderParams {
  userId: string
  productId: string
  quantity: number
  travelers: Traveler[]
  travelDate: string
  referrerId?: string
}

export interface OrderInfo {
  _id: string
  orderNo: string
  userId: string
  productId: string
  productName: string
  productPrice: number
  quantity: number
  totalAmount: number
  travelers: Traveler[]
  travelDate: string
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded'
  paymentMethod?: string
  paidAt?: Date
  createdAt: Date
  distribution?: {
    isSelfOrder?: boolean
    referrerId?: string
    isLockedOrder?: boolean
  }
}

// 创建订单
export function createOrder(data: CreateOrderParams) {
  return post<OrderInfo>('/order/create', data)
}

// 创建支付订单
export function createPayment(data: { orderId: string; paymentMethod: 'wechat' | 'alipay' }) {
  return post('/order/create-payment', data)
}

// 模拟支付成功
export function mockPay(data: { orderId: string; paymentMethod: 'wechat' | 'alipay' }) {
  return post('/order/mock-pay', data)
}

// 查询支付状态
export function getPayStatus(params: { orderId: string }) {
  return get('/order/pay-status', params)
}

// 获取订单列表
export function getOrderList(params: { 
  userId: string; 
  status?: string; 
  page?: number; 
  limit?: number 
}) {
  return get<{ list: OrderInfo[]; pagination: any }>('/order/list', params)
}

// 获取订单详情
export function getOrderDetail(params: { orderId: string }) {
  return get<OrderInfo>('/order/detail', params)
}

// 取消订单
export function cancelOrder(data: { orderId: string }) {
  return post('/order/cancel', data)
}

// 物流查询
export function getLogistics(params: { expressCompany: string; expressNo: string }) {
  return get<{
    company: string
    no: string
    tracks: { time: string; status: string; location: string }[]
  }>('/order/logistics', params)
}

// ============================================
// 退款相关
// ============================================

export interface RefundApplyResponse {
  refundStatus: string
  refundApplyTime: string
  refundReason: string
}

// 申请退款
export function applyRefund(data: { orderId: string; reason?: string }) {
  return post<RefundApplyResponse>('/refund/apply', data)
}

// 我的退款列表
export function getMyRefundList(params: { page?: number; limit?: number }) {
  return get<{
    list: OrderInfo[]
    pagination: { page: number; limit: number; total: number; pages: number }
  }>('/refund/my-list', params)
}

// ============================================
// 导入审核相关
// ============================================

export interface ImportSubmitParams {
  userId?: string
  phone: string
  nickname?: string
  importOrderNo: string
  importSource?: string
}

export interface ImportSubmitResponse {
  id: string
}

// 提交导入申请
export function submitImport(data: ImportSubmitParams) {
  return post<ImportSubmitResponse>('/import/submit', data)
}

// 查询导入审核状态
export function getImportStatus(params: { userId?: string; phone?: string }) {
  return get<{
    _id: string
    status: 'pending' | 'approved' | 'rejected'
    phone: string
    importOrderNo: string
    importSource: string
    createdAt: string
  }>('/import/status', params)
}
