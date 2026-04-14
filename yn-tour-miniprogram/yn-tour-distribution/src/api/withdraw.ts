// 提现相关API
import { get, post } from '../utils/request'

export interface AccountInfo {
  openid?: string
  alipayAccount?: string
  alipayName?: string
  bankName?: string
  bankAccount?: string
  bankAccountName?: string
}

export interface ApplyWithdrawParams {
  userId: string
  withdrawMethod: 'wechat' | 'alipay' | 'bank'
  accountInfo: AccountInfo
  amount: number
}

export interface WithdrawInfo {
  _id: string
  userId: string
  withdrawMethod: string
  accountInfo: AccountInfo
  amount: number
  fee: number
  actualAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'
  rejectReason?: string
  approvedBy?: string
  approvedAt?: Date
  processedAt?: Date
  completedAt?: Date
  createdAt: Date
}

// 申请提现
export function applyWithdraw(data: ApplyWithdrawParams) {
  return post<WithdrawInfo>('/withdraw/apply', data)
}

// 获取用户提现记录
export function getWithdrawList(params: { 
  userId: string; 
  page?: number; 
  limit?: number; 
  status?: string 
}) {
  return get<{ list: WithdrawInfo[]; pagination: any }>('/withdraw/list', params)
}

// 获取提现详情
export function getWithdrawDetail(params: { withdrawId: string }) {
  return get<WithdrawInfo>('/withdraw/detail', params)
}
