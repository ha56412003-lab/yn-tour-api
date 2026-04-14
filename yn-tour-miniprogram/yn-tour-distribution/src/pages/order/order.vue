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
</template>

<script setup>
	import { ref, computed } from 'vue'
import { useUserStore } from '../../store/user'

	const currentTab = ref(0)
	const tabs = ['全部', '待支付', '已支付', '处理中']
	
	// 当前登录用户ID（测试用）
	const currentUserId = computed(() => userStore.state.userId || 'mock_user_' + Date.now()).value

	const orderList = ref([])
	const showDetail = ref(false)
	const selectedOrder = ref(null)

	// 页面显示时加载订单
	onShow(() => {
		loadOrders()
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
			const res = await new Promise((resolve) => {
				uni.request({
					url: 'http://localhost:3000/api/order/list',
					method: 'GET',
					data: { userId: userStore.state.userId },
					success: resolve,
					fail: resolve
				})
			})
			// @ts-ignore
			if (res?.data?.code === 200) {
				// @ts-ignore
				orderList.value = res.data.data.list || []
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
		showDetail.value = true
	}

	const goToPay = (order) => {
		uni.showModal({
			title: '选择支付方式',
			content: `订单号: ${order.orderNo}\n金额: ¥${order.totalAmount}`,
			confirmText: '微信支付',
			cancelText: '支付宝',
			success: async (res) => {
				if (res.confirm) {
					await mockPay(order._id, 'wechat')
				} else {
					await mockPay(order._id, 'alipay')
				}
			}
		})
	}

	const mockPay = async (orderId, payMethod) => {
		uni.showLoading({ title: '支付中...' })
		try {
			const res = await new Promise((resolve) => {
				uni.request({
					url: 'http://localhost:3000/api/order/mock-pay',
					method: 'POST',
					data: { orderId, paymentMethod: payMethod },
					success: resolve,
					fail: resolve
				})
			})
			uni.hideLoading()
			// @ts-ignore
			if (res?.data?.code === 200) {
				uni.showToast({ title: '支付成功', icon: 'success' })
				loadOrders()
			} else {
				uni.showToast({ title: '支付成功（模拟）', icon: 'success' })
				loadOrders()
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
</style>
