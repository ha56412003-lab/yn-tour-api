<template>
	<view class="order">
		<!-- 订单tabs -->
		<view class="tabs">
			<view 
				v-for="(tab, index) in tabs" 
				:key="index"
				class="tab-item"
				:class="{ active: currentTab === index }"
				@click="switchTab(index)"
			>
				{{ tab }}
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="order-list">
			<view class="order-item" v-for="(order, index) in filteredOrders" :key="index" @click="showOrderDetail(order)">
				<view class="order-header">
					<text class="order-no">{{ order.orderNo }}</text>
					<text class="order-status" :class="getStatusClass(order)">{{ getStatusText(order) }}</text>
				</view>
				
				<view class="order-content">
					<image class="order-img" src="/static/product1.jpg" mode="aspectFill"></image>
					<view class="order-info">
						<text class="order-name">{{ order.productName }}</text>
						<text class="order-date">下单时间：{{ formatDate(order.createdAt) }}</text>
						<view class="order-price">
							<text class="price">¥{{ order.totalAmount }}</text>
							<text class="num">x{{ order.quantity }}</text>
						</view>
					</view>
				</view>
				
				<!-- 发货信息 -->
				<view class="delivery-info" v-if="order.deliveryStatus === 'shipped'">
					<view class="delivery-row">
						<text class="delivery-icon">📦</text>
						<text class="delivery-text">已发货 | {{ order.expressCompany }} {{ order.expressNo }}</text>
					</view>
				</view>
				
				<!-- 收货地址 -->
				<view class="address-info" v-if="order.deliveryAddress">
					<text class="address-icon">📍</text>
					<text class="address-text">{{ order.deliveryAddress.receiverName }} {{ order.deliveryAddress.receiverPhone }}</text>
					<text class="address-detail">{{ order.deliveryAddress.fullAddress }}</text>
				</view>
				
				<view class="order-footer">
					<view class="order-total">
						<text class="total-label">合计:</text>
						<text class="total-price">¥{{ order.totalAmount }}</text>
					</view>
					<view class="order-btns">
						<button class="btn btn-pay" v-if="order.status === 'pending'" @click.stop="goToPay(order)">去支付</button>
						<button class="btn btn-detail" v-if="order.status === 'paid' || order.deliveryStatus === 'shipped'" @click.stop="showOrderDetail(order)">查看详情</button>
						<button class="btn btn-refund" v-if="canApplyRefund(order)" @click.stop="openRefundModal(order)">申请退款</button>
						<text class="refund-tip refund-applying" v-if="order.refundStatus === 'applying'">退款中</text>
						<text class="refund-tip refund-approved" v-if="order.refundStatus === 'approved'">已退款</text>
						<text class="refund-tip refund-rejected" v-if="order.refundStatus === 'rejected'">退款被拒</text>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty" v-if="filteredOrders.length === 0">
				<text class="empty-icon">📋</text>
				<text class="empty-text">暂无订单</text>
			</view>
		</view>
		
		<!-- 订单详情弹窗 -->
		<view class="detail-modal" v-if="showDetail" @click="showDetail = false">
			<view class="detail-content" @click.stop>
				<view class="detail-header">
					<text>订单详情</text>
					<text class="close-btn" @click="showDetail = false">✕</text>
				</view>
				
				<view class="detail-body" v-if="selectedOrder">
					<!-- 订单状态 -->
					<view class="status-section">
						<view class="status-step" :class="{ active: selectedOrder.status !== 'pending' }">
							<view class="step-dot">1</view>
							<view class="step-info">
								<text class="step-title">提交订单</text>
								<text class="step-time" v-if="selectedOrder.createdAt">{{ formatDate(selectedOrder.createdAt) }}</text>
							</view>
						</view>
						<view class="step-line" :class="{ active: selectedOrder.status !== 'pending' }"></view>
						<view class="status-step" :class="{ active: selectedOrder.status === 'paid' || selectedOrder.status === 'processing' || selectedOrder.status === 'completed' }">
							<view class="step-dot">2</view>
							<view class="step-info">
								<text class="step-title">支付成功</text>
								<text class="step-time" v-if="selectedOrder.paidAt">{{ formatDate(selectedOrder.paidAt) }}</text>
							</view>
						</view>
						<view class="step-line" :class="{ active: selectedOrder.status === 'processing' || selectedOrder.status === 'completed' }"></view>
						<view class="status-step" :class="{ active: selectedOrder.deliveryStatus === 'shipped' || selectedOrder.status === 'completed' }">
							<view class="step-dot">3</view>
							<view class="step-info">
								<text class="step-title">已发货</text>
								<text class="step-time" v-if="selectedOrder.shippedAt">{{ formatDate(selectedOrder.shippedAt) }}</text>
							</view>
						</view>
						<view class="step-line" :class="{ active: selectedOrder.status === 'completed' }"></view>
						<view class="status-step" :class="{ active: selectedOrder.status === 'completed' }">
							<view class="step-dot">4</view>
							<view class="step-info">
								<text class="step-title">确认收货</text>
								<text class="step-time" v-if="selectedOrder.completedAt">{{ formatDate(selectedOrder.completedAt) }}</text>
							</view>
						</view>
					</view>
					
					<!-- 物流信息 -->
					<view class="info-section" v-if="selectedOrder.expressCompany">
						<view class="section-title">物流信息</view>
						<view class="info-row">
							<text class="info-label">快递公司</text>
							<text class="info-value">{{ selectedOrder.expressCompany }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">快递单号</text>
							<text class="info-value">{{ selectedOrder.expressNo }}</text>
						</view>
						<view class="logistics-query-row">
							<button class="query-btn" size="mini" :loading="logisticsLoading" @click="queryLogistics">
								{{ logisticsTracks.length > 0 ? '刷新物流' : '查询物流' }}
							</button>
						</view>
						<!-- 物流轨迹 -->
						<view class="logistics-tracks" v-if="logisticsTracks.length > 0">
							<view class="track-item" v-for="(track, index) in logisticsTracks" :key="index" :class="{ latest: index === 0 }">
								<view class="track-dot"></view>
								<view class="track-content">
									<text class="track-status">{{ track.status }}</text>
									<text class="track-time">{{ track.time }}</text>
								</view>
							</view>
						</view>
						<view class="logistics-empty" v-else-if="logisticsLoading">
							<text class="loading-text">查询中...</text>
						</view>
					</view>
					
					<!-- 收货地址 -->
					<view class="info-section" v-if="selectedOrder.deliveryAddress">
						<view class="section-title">收货地址</view>
						<view class="info-row">
							<text class="info-label">收货人</text>
							<text class="info-value">{{ selectedOrder.deliveryAddress.receiverName }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">手机号</text>
							<text class="info-value">{{ selectedOrder.deliveryAddress.receiverPhone }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">详细地址</text>
							<text class="info-value">{{ selectedOrder.deliveryAddress.fullAddress }}</text>
						</view>
					</view>
					
					<!-- 商品信息 -->
					<view class="info-section">
						<view class="section-title">商品信息</view>
						<view class="product-card">
							<image class="product-img" src="/static/product1.jpg"></image>
							<view class="product-info">
								<text class="product-name">{{ selectedOrder.productName }}</text>
								<text class="product-price">¥{{ selectedOrder.totalAmount }}</text>
							</view>
						</view>
					</view>
					
					<!-- 订单信息 -->
					<view class="info-section">
						<view class="section-title">订单信息</view>
						<view class="info-row">
							<text class="info-label">订单编号</text>
							<text class="info-value">{{ selectedOrder.orderNo }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">下单时间</text>
							<text class="info-value">{{ formatDate(selectedOrder.createdAt) }}</text>
						</view>
						<view class="info-row" v-if="selectedOrder.paidAt">
							<text class="info-label">支付时间</text>
							<text class="info-value">{{ formatDate(selectedOrder.paidAt) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>

		<!-- 退款申请弹窗 -->
		<view class="refund-modal" v-if="showRefundModal" @click="showRefundModal = false">
			<view class="refund-modal-content" @click.stop>
				<view class="refund-modal-header">
					<text>申请退款</text>
					<text class="close-btn" @click="showRefundModal = false">✕</text>
				</view>
				<view class="refund-modal-body">
					<view class="refund-rule">
						<text class="rule-title">退款规则</text>
						<text class="rule-item">• 付款后7天内：无条件退款</text>
						<text class="rule-item">• 付款后7-30天：协商退款</text>
						<text class="rule-item">• 付款后超过30天：不可退款</text>
					</view>
					<view class="refund-form">
						<text class="form-label">退款原因（选填）</text>
						<textarea class="refund-textarea" v-model="refundReason" placeholder="请输入退款原因..." maxlength="200"></textarea>
					</view>
					<view class="refund-order-info" v-if="refundOrder">
						<text class="order-info-label">订单号：{{ refundOrder.orderNo }}</text>
						<text class="order-info-amount">退款金额：¥{{ refundOrder.totalAmount }}</text>
					</view>
					<view class="refund-btns">
						<button class="refund-cancel" @click="showRefundModal = false">取消</button>
						<button class="refund-confirm" :loading="refundLoading" @click="confirmRefund">确认提交</button>
					</view>
				</view>
			</view>
		</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getOrderList, mockPay, getLogistics, applyRefund } from '@/api/order'

const userStore = useUserStore()

const currentTab = ref(0)
const tabs = ['全部', '待支付', '已支付', '处理中']

const orderList = ref([])
const showDetail = ref(false)
const selectedOrder = ref(null)
// 退款弹窗
const showRefundModal = ref(false)
const refundOrder = ref(null)
const refundReason = ref('')
const refundLoading = ref(false)
const logisticsTracks = ref([])
const logisticsLoading = ref(false)

onShow(() => {
  if (userStore.state.isLoggedIn) {
    loadOrders()
  }
})

const filteredOrders = computed(() => {
  if (currentTab.value === 0) return orderList.value
  if (currentTab.value === 1) return orderList.value.filter(o => o.status === 'pending')
  if (currentTab.value === 2) return orderList.value.filter(o => o.status === 'paid')
  if (currentTab.value === 3) return orderList.value.filter(o => o.status === 'processing' || o.deliveryStatus === 'shipped')
  return orderList.value
})

const loadOrders = async () => {
  try {
    const userId = userStore.state.userId
    if (!userId) return
    const res = await getOrderList({ userId })
    if (res.code === 200) {
      orderList.value = res.data?.list || []
    }
  } catch (e) {
    console.error('加载订单失败', e)
  }
}

const switchTab = (index) => {
  currentTab.value = index
}

const showOrderDetail = (order) => {
  selectedOrder.value = order
  logisticsTracks.value = []
  showDetail.value = true
}

const queryLogistics = async () => {
  if (!selectedOrder.value?.expressCompany || !selectedOrder.value?.expressNo) return
  logisticsLoading.value = true
  try {
    const res = await getLogistics({
      expressCompany: selectedOrder.value.expressCompany,
      expressNo: selectedOrder.value.expressNo
    })
    if (res.code === 200 && res.data?.tracks) {
      logisticsTracks.value = res.data.tracks
    } else {
      uni.showToast({ title: '查询失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '查询失败', icon: 'none' })
  } finally {
    logisticsLoading.value = false
  }
}

const goToPay = (order) => {
  uni.showModal({
    title: '选择支付方式',
    content: `订单号: ${order.orderNo}\n金额: ¥${order.totalAmount}`,
    confirmText: '微信支付',
    cancelText: '支付宝',
    success: async (res) => {
      if (res.confirm) {
        await handlePay(order._id, 'wechat')
      } else {
        await handlePay(order._id, 'alipay')
      }
    }
  })
}

const handlePay = async (orderId, payMethod) => {
  uni.showLoading({ title: '支付中...' })
  try {
    const res = await mockPay({ orderId, paymentMethod: payMethod })
    uni.hideLoading()
    if (res.code === 200) {
      uni.showToast({ title: '支付成功', icon: 'success' })
      showDetail.value = false
      loadOrders()
    } else {
      uni.showToast({ title: res.message || '支付失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '支付失败', icon: 'none' })
  }
}

	const getStatusClass = (order) => {
		if (order.status === 'completed') return 'completed'
		if (order.status === 'pending') return 'pending'
		if (order.deliveryStatus === 'shipped' || order.status === 'processing') return 'shipped'
		if (order.status === 'paid') return 'paid'
		return ''
	}

	const getStatusText = (order) => {
		if (order.status === 'completed') return '已完成'
		if (order.status === 'pending') return '待支付'
		if (order.status === 'paid') return '已支付'
		if (order.deliveryStatus === 'shipped') return '已发货'
		if (order.status === 'processing') return '处理中'
		return ''
	}

	const formatDate = (dateStr) => {
		if (!dateStr) return '-'
		const date = new Date(dateStr)
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
	}

	const canApplyRefund = (order) => {
		if (order.status !== 'paid') return false
		if (order.refundStatus && order.refundStatus !== 'none') return false
		if (!order.paidAt) return false
		const daysDiff = (Date.now() - new Date(order.paidAt).getTime()) / (1000 * 60 * 60 * 24)
		return daysDiff <= 30
	}

	const openRefundModal = (order) => {
		refundOrder.value = order
		refundReason.value = ''
		showRefundModal.value = true
	}

	const confirmRefund = async () => {
		if (!refundOrder.value) return
		refundLoading.value = true
		try {
			const res = await applyRefund({
				orderId: refundOrder.value._id,
				reason: refundReason.value
			})
			if (res.success) {
				uni.showToast({ title: '退款申请已提交', icon: 'success' })
				showRefundModal.value = false
				loadOrders()
			} else {
				uni.showToast({ title: res.message, icon: 'none' })
			}
		} catch (e) {
			uni.showToast({ title: '申请失败', icon: 'none' })
		} finally {
			refundLoading.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.order {
		min-height: 100vh;
		background: #f5f5f5;
	}

	.tabs {
		display: flex;
		background: #fff;
		padding: 0 30rpx;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab-item {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #ff6600;
		font-weight: bold;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 4rpx;
		background: #ff6600;
		border-radius: 2rpx;
	}

	.order-list {
		padding: 20rpx 30rpx;
	}

	.order-item {
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.order-no {
		font-size: 24rpx;
		color: #999;
	}

	.order-status {
		font-size: 26rpx;
		font-weight: 600;
	}

	.order-status.pending { color: #ff6600; }
	.order-status.paid { color: #2E8B57; }
	.order-status.shipped { color: #667eea; }
	.order-status.completed { color: #999; }

	.order-content {
		display: flex;
		padding: 20rpx 30rpx;
	}

	.order-img {
		width: 160rpx;
		height: 120rpx;
		border-radius: 8rpx;
		background: #f0f0f0;
	}

	.order-info {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.order-name {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}

	.order-date {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.order-price {
		display: flex;
		justify-content: space-between;
		margin-top: 10rpx;
	}

	.price {
		font-size: 28rpx;
		color: #ff6600;
		font-weight: bold;
	}

	.num {
		font-size: 24rpx;
		color: #999;
	}

	.delivery-info {
		padding: 16rpx 30rpx;
		background: #f0f5ff;
		border-top: 1rpx solid #e8eeff;
	}

	.delivery-row {
		display: flex;
		align-items: center;
	}

	.delivery-icon {
		font-size: 28rpx;
		margin-right: 10rpx;
	}

	.delivery-text {
		font-size: 24rpx;
		color: #667eea;
	}

	.address-info {
		padding: 16rpx 30rpx;
		background: #fafafa;
		border-top: 1rpx solid #f0f0f0;
	}

	.address-icon {
		font-size: 24rpx;
		margin-right: 8rpx;
	}

	.address-text {
		font-size: 24rpx;
		color: #333;
	}

	.address-detail {
		display: block;
		font-size: 22rpx;
		color: #999;
		margin-top: 4rpx;
		margin-left: 32rpx;
	}

	.order-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.order-total {
		display: flex;
		align-items: center;
	}

	.total-label {
		font-size: 28rpx;
		color: #333;
	}

	.total-price {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff6600;
	}

	.order-btns {
		display: flex;
		gap: 16rpx;
	}

	.btn {
		padding: 10rpx 30rpx;
		font-size: 24rpx;
		border-radius: 30rpx;
		border: none;
	}

	.btn-pay {
		background: linear-gradient(135deg, #ff6600, #ff8c00);
		color: #fff;
	}

	.btn-detail {
		background: #fff;
		border: 1rpx solid #ddd;
		color: #666;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 100rpx 0;
	}

	.empty-icon {
		font-size: 80rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
		margin-top: 20rpx;
	}

	/* 详情弹窗 */
	.detail-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.5);
		z-index: 100;
		display: flex;
		align-items: flex-end;
	}

	.detail-content {
		width: 100%;
		max-height: 85vh;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		overflow-y: auto;
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		position: sticky;
		top: 0;
		background: #fff;
	}

	.detail-header text:first-child {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.close-btn {
		font-size: 48rpx;
		color: #999;
		line-height: 1;
	}

	.detail-body {
		padding: 30rpx;
	}

	/* 状态流程 */
	.status-section {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 20rpx 0 40rpx;
	}

	.status-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 120rpx;
	}

	.step-dot {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background: #ddd;
		color: #fff;
		font-size: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 10rpx;
	}

	.status-step.active .step-dot {
		background: linear-gradient(135deg, #ff6600, #ff8c00);
	}

	.step-info {
		text-align: center;
	}

	.step-title {
		font-size: 22rpx;
		color: #999;
		display: block;
	}

	.status-step.active .step-title {
		color: #333;
		font-weight: 600;
	}

	.step-time {
		font-size: 18rpx;
		color: #ccc;
		display: block;
		margin-top: 4rpx;
	}

	.step-line {
		flex: 1;
		height: 2rpx;
		background: #ddd;
		margin-top: 24rpx;
	}

	.step-line.active {
		background: linear-gradient(90deg, #ff6600, #ff8c00);
	}

	/* 信息区块 */
	.info-section {
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-bottom: 10rpx;
		border-bottom: 1rpx solid #eee;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 12rpx 0;
	}

	.info-label {
		font-size: 26rpx;
		color: #666;
	}

	.info-value {
		font-size: 26rpx;
		color: #333;
		max-width: 65%;
		text-align: right;
	}

	.logistics-query-row {
		display: flex;
		justify-content: flex-end;
		margin-top: 12rpx;
	}

	.query-btn {
		background: linear-gradient(135deg, #ff6600, #ff8c00);
		color: #fff;
		font-size: 22rpx;
		padding: 0 20rpx;
		height: 52rpx;
		line-height: 52rpx;
		border-radius: 26rpx;
	}

	.logistics-tracks {
		margin-top: 20rpx;
		padding: 10rpx 0;
	}

	.track-item {
		display: flex;
		align-items: flex-start;
		padding: 10rpx 0;
		position: relative;
	}

	.track-item::before {
		content: '';
		position: absolute;
		left: 10rpx;
		top: 30rpx;
		width: 1rpx;
		height: calc(100% - 20rpx);
		background: #eee;
	}

	.track-item:last-child::before {
		display: none;
	}

	.track-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background: #ccc;
		margin-right: 16rpx;
		margin-top: 6rpx;
		flex-shrink: 0;
		position: relative;
		z-index: 1;
	}

	.track-item.latest .track-dot {
		background: #ff6600;
		box-shadow: 0 0 0 4rpx rgba(255,102,0,0.2);
	}

	.track-content {
		flex: 1;
	}

	.track-status {
		display: block;
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
	}

	.track-item.latest .track-status {
		color: #ff6600;
		font-weight: bold;
	}

	.track-time {
		display: block;
		font-size: 22rpx;
		color: #999;
		margin-top: 4rpx;
	}

	.logistics-empty {
		text-align: center;
		padding: 20rpx 0;
	}

	.loading-text {
		font-size: 24rpx;
		color: #999;
	}

	.product-card {
		display: flex;
		background: #fafafa;
		border-radius: 12rpx;
		padding: 20rpx;
	}

	.product-img {
		width: 120rpx;
		height: 90rpx;
		border-radius: 8rpx;
		background: #eee;
	}

	.product-info {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.product-name {
		font-size: 26rpx;
		color: #333;
		font-weight: 600;
	}

	.product-price {
		font-size: 28rpx;
		color: #ff6600;
		font-weight: bold;
	}

	/* 退款按钮 */
	.btn-refund {
		font-size: 22rpx;
		color: #999;
		background: #f5f5f5;
		border: 1rpx solid #ddd;
		border-radius: 20rpx;
		padding: 0 16rpx;
		height: 48rpx;
		line-height: 48rpx;
		margin-left: 8rpx;
	}
	.btn-refund::after { border: none; }

	.refund-tip {
		font-size: 22rpx;
		padding: 0 12rpx;
		height: 48rpx;
		line-height: 48rpx;
		border-radius: 20rpx;
		margin-left: 8rpx;
	}
	.refund-applying { color: #ff9500; background: #fff8e6; }
	.refund-approved { color: #999; background: #f5f5f5; }
	.refund-rejected { color: #e8344e; background: #fff0f0; }

	/* 退款弹窗 */
	.refund-modal {
		position: fixed;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.5);
		z-index: 200;
		display: flex;
		align-items: flex-end;
	}
	.refund-modal-content {
		width: 100%;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
	}
	.refund-modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
	}
	.refund-modal-header text:first-child {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
	.refund-modal-body {
		padding: 30rpx;
	}
	.refund-rule {
		background: #f9f9f9;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 24rpx;
	}
	.rule-title {
		display: block;
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}
	.rule-item {
		display: block;
		font-size: 24rpx;
		color: #666;
		line-height: 1.8;
	}
	.refund-form {
		margin-bottom: 20rpx;
	}
	.form-label {
		display: block;
		font-size: 26rpx;
		color: #333;
		margin-bottom: 10rpx;
		font-weight: 500;
	}
	.refund-textarea {
		width: 100%;
		box-sizing: border-box;
		background: #f8f9fa;
		border-radius: 12rpx;
		padding: 20rpx;
		font-size: 28rpx;
		min-height: 160rpx;
		border: 1rpx solid #eee;
	}
	.refund-order-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-top: 1rpx solid #f0f0f0;
		margin-bottom: 20rpx;
	}
	.order-info-label {
		font-size: 24rpx;
		color: #999;
	}
	.order-info-amount {
		font-size: 28rpx;
		color: #e8344e;
		font-weight: bold;
	}
	.refund-btns {
		display: flex;
		gap: 20rpx;
	}
	.refund-cancel {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		background: #f5f5f5;
		color: #666;
		font-size: 30rpx;
		border-radius: 44rpx;
		border: none;
	}
	.refund-cancel::after { border: none; }
	.refund-confirm {
		flex: 2;
		height: 88rpx;
		line-height: 88rpx;
		background: linear-gradient(135deg, #e8344e, #ff6b6b);
		color: #fff;
		font-size: 30rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
	}
	.refund-confirm::after { border: none; }
</style>
