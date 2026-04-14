<template>
	<view class="product">
		<!-- 图片轮播 -->
		<swiper class="swiper" indicator-dots autoplay circular>
			<swiper-item>
				<image src="/static/product1.jpg" mode="aspectFill" />
			</swiper-item>
			<swiper-item>
				<image src="/static/product2.jpg" mode="aspectFill" />
			</swiper-item>
			<swiper-item>
				<image src="/static/product3.jpg" mode="aspectFill" />
			</swiper-item>
		</swiper>

		<!-- 价格区域 -->
		<view class="price-section">
			<view class="price-row">
				<text class="price-symbol">¥</text>
				<text class="price-value">799</text>
				<text class="price-unit">/套</text>
			</view>
			<view class="original-price">原价: ¥2999</view>
		</view>

		<!-- 产品标题 -->
		<view class="product-section">
			<view class="product-title">云南6天5晚 · 深度纯玩游</view>
			<view class="product-subtitle">昆明大理丽江 · 洱海 · 玉龙雪山 · 泸沽湖</view>
			<view class="product-tags">
				<text class="tag">🎁 实物旅游卡</text>
				<text class="tag">📅 随时可约</text>
				<text class="tag">🏨 5晚住宿</text>
				<text class="tag">🚗 专车接送</text>
			</view>
		</view>

		<!-- 旅游卡说明 -->
		<view class="product-section">
			<view class="section-title">🎁 旅游卡说明</view>
			<view class="card-info">
				<view class="card-item">
					<text class="card-icon">📦</text>
					<view class="card-text">
						<text class="card-title">实物卡片 快递到家</text>
						<text class="card-desc">购买后1-3天内发货，全国包邮，收到的旅游卡可随时预约出行</text>
					</view>
				</view>
				<view class="card-item">
					<text class="card-icon">📅</text>
					<view class="card-text">
						<text class="card-title">一次购买 永久有效</text>
						<text class="card-desc">旅游卡不设过期日期，购买后可根据自己的时间安排随时预约</text>
					</view>
				</view>
				<view class="card-item">
					<text class="card-icon">👨‍👩‍👧</text>
					<view class="card-text">
						<text class="card-title">赠送亲友 贴心礼品</text>
						<text class="card-desc">精美卡片包装，送礼自用两相宜，让TA自己选择出行时间</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 行程安排 -->
		<view class="product-section">
			<view class="section-title">📍 行程安排</view>
			<view class="trip-item">
				<view class="trip-day">Day 1</view>
				<view class="trip-content">
					<text class="trip-city">昆明</text>
					<text class="trip-desc">抵达昆明，专车接机，入住酒店</text>
				</view>
			</view>
			<view class="trip-item">
				<view class="trip-day">Day 2</view>
				<view class="trip-content">
					<text class="trip-city">昆明 → 大理</text>
					<text class="trip-desc">游览滇池、洱海骑行</text>
				</view>
			</view>
			<view class="trip-item">
				<view class="trip-day">Day 3</view>
				<view class="trip-content">
					<text class="trip-city">大理 → 丽江</text>
					<text class="trip-desc">大理古城、丽江古城</text>
				</view>
			</view>
			<view class="trip-item">
				<view class="trip-day">Day 4</view>
				<view class="trip-content">
					<text class="trip-city">丽江</text>
					<text class="trip-desc">玉龙雪山、蓝月谷</text>
				</view>
			</view>
			<view class="trip-item">
				<view class="trip-day">Day 5</view>
				<view class="trip-content">
					<text class="trip-city">丽江 → 泸沽湖</text>
					<text class="trip-desc">泸沽湖环湖、摩梭篝火</text>
				</view>
			</view>
			<view class="trip-item">
				<view class="trip-day">Day 6</view>
				<view class="trip-content">
					<text class="trip-city">返程</text>
					<text class="trip-desc">泸沽湖送机，结束行程</text>
				</view>
			</view>
		</view>

		<!-- 费用说明 -->
		<view class="product-section">
			<view class="section-title">💰 费用说明</view>
			<view class="fee-include">
				<view class="fee-title">✅ 费用包含</view>
				<view class="fee-item">• 5晚特色酒店住宿</view>
				<view class="fee-item">• 行程中全程用车</view>
				<view class="fee-item">• 景区门票（玉龙雪山含索道）</view>
				<view class="fee-item">• 导游服务</view>
				<view class="fee-item">• 旅游意外险</view>
			</view>
			<view class="fee-exclude">
				<view class="fee-title">❌ 费用不含</view>
				<view class="fee-item">• 往返大交通（机票/火车票）</view>
				<view class="fee-item">• 个人消费</view>
				<view class="fee-item">• 行程中自选项目</view>
			</view>
		</view>

		<!-- 预约流程 -->
		<view class="product-section">
			<view class="section-title">📝 如何预约</view>
			<view class="flow-steps">
				<view class="step">
					<view class="step-num">1</view>
					<view class="step-text">购买后收取旅游卡</view>
				</view>
				<view class="step-arrow">→</view>
				<view class="step">
					<view class="step-num">2</view>
					<view class="step-text">拨打卡上预约电话</view>
				</view>
				<view class="step-arrow">→</view>
				<view class="step">
					<view class="step-num">3</view>
					<view class="step-text">选择出行日期出发</view>
				</view>
			</view>
		</view>

		<!-- 底部操作 -->
		<view class="bottom-action">
			<view class="action-left">
				<view class="action-item" @click="contactService">
					<text class="action-icon">💬</text>
					<text class="action-text">客服</text>
				</view>
				<view class="action-item" @click="shareProduct">
					<text class="action-icon">📤</text>
					<text class="action-text">分享</text>
				</view>
			</view>
			<button class="buy-btn" @click="showAddressModal">立即购买</button>
		</view>

		<!-- 收货地址弹窗 -->
		<view class="address-modal" v-if="showAddress" @click="showAddress = false">
			<view class="address-form" @click.stop>
				<view class="form-header">
					<text class="form-title">填写收货地址</text>
					<text class="form-close" @click="showAddress = false">✕</text>
				</view>
				
				<view class="form-body">
					<view class="form-item">
						<text class="form-label">收货人</text>
						<input class="form-input" v-model="address.name" placeholder="请输入收货人姓名" />
					</view>
					<view class="form-item">
						<text class="form-label">手机号码</text>
						<input class="form-input" v-model="address.phone" type="number" placeholder="请输入手机号码" maxlength="11" />
					</view>
					<view class="form-item">
						<text class="form-label">省份</text>
						<picker mode="region" @change="onProvinceChange">
							<view class="form-picker">
								<text :class="address.province ? '' : 'placeholder'">{{ address.province || '请选择省份' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</picker>
					</view>
					<view class="form-item">
						<text class="form-label">详细地址</text>
						<textarea class="form-textarea" v-model="address.detail" placeholder="请输入街道、门牌号等详细地址" />
					</view>
				</view>

				<view class="form-footer">
					<view class="product-summary">
						<text class="summary-label">商品金额：</text>
						<text class="summary-price">¥799</text>
					</view>
					<button class="submit-btn" @click="submitOrder">提交订单</button>
				</view>
			</view>
		</view>

		<!-- 订单确认弹窗 -->
		<view class="confirm-modal" v-if="showConfirm" @click="showConfirm = false">
			<view class="confirm-content" @click.stop>
				<view class="confirm-header">
					<text>订单确认</text>
					<text class="confirm-close" @click="showConfirm = false">✕</text>
				</view>
				<view class="confirm-body">
					<view class="confirm-item">
						<text class="confirm-label">商品</text>
						<text class="confirm-value">云南6天5晚 · 深度纯玩游</text>
					</view>
					<view class="confirm-item">
						<text class="confirm-label">数量</text>
						<text class="confirm-value">1套</text>
					</view>
					<view class="confirm-item">
						<text class="confirm-label">金额</text>
						<text class="confirm-price">¥799</text>
					</view>
					<view class="confirm-item">
						<text class="confirm-label">收货人</text>
						<text class="confirm-value">{{ address.name }}</text>
					</view>
					<view class="confirm-item">
						<text class="confirm-label">手机</text>
						<text class="confirm-value">{{ address.phone }}</text>
					</view>
					<view class="confirm-item">
						<text class="confirm-label">地址</text>
						<text class="confirm-value">{{ address.province }}{{ address.detail }}</text>
					</view>
				</view>
				<view class="confirm-footer">
					<view class="pay-amount">
						<text>合计：</text>
						<text class="pay-price">¥799</text>
					</view>
					<view class="pay-btns">
						<button class="pay-btn wechat" @click="doPay('wechat')">微信支付</button>
						<button class="pay-btn alipay" @click="doPay('alipay')">支付宝</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore, userState } from '../../store/user'
import { getProductDetail } from '../../api/product'
import { createOrder, mockPay } from '../../api/order'

const userStore = useUserStore()

// 当前商品数据
const productData = ref<any>(null)
const currentProductId = ref('')

onLoad((options) => {
  if (options?.productId) {
    currentProductId.value = options.productId
    loadProductDetail(options.productId)
  }
})

function loadProductDetail(productId) {
  getProductDetail({ productId }).then(res => {
    if (res.code === 200) {
      productData.value = res.data
    }
  }).catch(e => {
    console.error('加载商品详情失败', e)
  })
}

function getCurrentUserId() {
  return userStore.state.userId || 'mock_user_' + Date.now()
}

function getCurrentProductId() {
  return currentProductId.value || '69cb50a4023e1235c0a7d4f3'
}

const showAddress = ref(false)
const showConfirm = ref(false)

const address = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: ''
})

	const contactService = () => {
		uni.showToast({
			title: '联系客服：400-888-8888',
			icon: 'none'
		})
	}

	const shareProduct = () => {
		uni.showToast({
			title: '分享功能开发中',
			icon: 'none'
		})
	}

	const showAddressModal = () => {
		showAddress.value = true
	}

	const onProvinceChange = (e) => {
		const [province, city, district] = e.detail.value
		address.value.province = province
		address.value.city = city
		address.value.district = district
	}

	const submitOrder = () => {
		// 验证表单
		if (!address.value.name) {
			uni.showToast({ title: '请输入收货人', icon: 'none' })
			return
		}
		if (!address.value.phone || address.value.phone.length !== 11) {
			uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
			return
		}
		if (!address.value.province) {
			uni.showToast({ title: '请选择省份', icon: 'none' })
			return
		}
		if (!address.value.detail) {
			uni.showToast({ title: '请输入详细地址', icon: 'none' })
			return
		}

		// 关闭地址弹窗，显示确认弹窗
		showAddress.value = false
		showConfirm.value = true
	}

	const doPay = async (payMethod) => {
		uni.showLoading({ title: '创建订单...' })
		
		try {
			// 创建订单
			const orderRes = await new Promise((resolve) => {
				uni.request({
					url: 'http://localhost:3000/api/order/create',
					method: 'POST',
					data: {
						userId: getCurrentUserId(),
						productId: getCurrentProductId(),
						quantity: 1,
						travelers: [{
							name: address.value.name,
							phone: address.value.phone,
							idCard: ''
						}],
						// 旅游卡不需要出行日期，但订单模型需要
						travelDate: '2099-12-31',
						// 添加收货地址信息
						deliveryAddress: {
							receiverName: address.value.name,
							receiverPhone: address.value.phone,
							province: address.value.province,
							city: address.value.city,
							district: address.value.district,
							detailAddress: address.value.detail,
							fullAddress: `${address.value.province}${address.value.city}${address.value.district}${address.value.detail}`
						}
					},
					success: resolve,
					fail: resolve
				})
			})

			uni.hideLoading()

			// @ts-ignore
			if (orderRes?.data?.code === 200) {
				// @ts-ignore
				const orderId = orderRes?.data?.data?._id
				
				// 模拟支付
				const payRes = await new Promise((resolve) => {
					uni.request({
						url: 'http://localhost:3000/api/order/mock-pay',
						method: 'POST',
						data: { orderId, paymentMethod: payMethod },
						success: resolve,
						fail: resolve
					})
				})

				// @ts-ignore
				if (payRes?.data?.code === 200) {
					showConfirm.value = false
					uni.showModal({
						title: '支付成功！',
						content: '旅游卡将在1-3天内寄出，请注意查收！',
						showCancel: false,
						confirmText: '知道了'
					})
				} else {
					uni.showToast({ title: '支付失败', icon: 'none' })
				}
			} else {
				uni.showToast({ title: '创建订单失败', icon: 'none' })
			}
		} catch (e) {
			uni.hideLoading()
			uni.showToast({ title: '操作失败', icon: 'none' })
		}
	}
</script>

<style lang="scss">
	.product {
		padding-bottom: 120rpx;
		background: #f5f5f5;
	}

	.swiper {
		height: 500rpx;
	}

	.swiper image {
		width: 100%;
		height: 100%;
	}

	.price-section {
		background: #fff;
		padding: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.price-row {
		display: flex;
		align-items: baseline;
	}

	.price-symbol {
		font-size: 28rpx;
		color: #ff6600;
	}

	.price-value {
		font-size: 56rpx;
		font-weight: bold;
		color: #ff6600;
	}

	.price-unit {
		font-size: 24rpx;
		color: #999;
		margin-left: 10rpx;
	}

	.original-price {
		font-size: 24rpx;
		color: #999;
		text-decoration: line-through;
	}

	.product-section {
		background: #fff;
		margin-top: 20rpx;
		padding: 30rpx;
	}

	.product-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.product-subtitle {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 20rpx;
	}

	.product-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}

	.tag {
		padding: 8rpx 16rpx;
		background: #fff5f5;
		color: #ff6600;
		font-size: 22rpx;
		border-radius: 4rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-bottom: 15rpx;
		border-bottom: 1rpx solid #eee;
	}

	.card-info {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}

	.card-item {
		display: flex;
		align-items: flex-start;
	}

	.card-icon {
		font-size: 48rpx;
		margin-right: 20rpx;
	}

	.card-text {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}

	.card-desc {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
	}

	.trip-item {
		display: flex;
		margin-bottom: 20rpx;
	}

	.trip-day {
		width: 100rpx;
		height: 60rpx;
		line-height: 60rpx;
		background: #2E8B57;
		color: #fff;
		font-size: 22rpx;
		text-align: center;
		border-radius: 8rpx;
		flex-shrink: 0;
	}

	.trip-content {
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.trip-city {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}

	.trip-desc {
		font-size: 24rpx;
		color: #666;
	}

	.fee-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 15rpx;
	}

	.fee-item {
		font-size: 26rpx;
		color: #666;
		line-height: 40rpx;
	}

	.fee-exclude {
		margin-top: 30rpx;
	}

	.flow-steps {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.step-num {
		width: 60rpx;
		height: 60rpx;
		line-height: 60rpx;
		background: linear-gradient(135deg, #ff6600, #ff8c00);
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		border-radius: 50%;
		text-align: center;
		margin-bottom: 10rpx;
	}

	.step-text {
		font-size: 22rpx;
		color: #666;
		text-align: center;
	}

	.step-arrow {
		font-size: 32rpx;
		color: #ccc;
		padding: 0 10rpx;
	}

	.bottom-action {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);
	}

	.action-left {
		display: flex;
		flex: 1;
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 40rpx;
	}

	.action-icon {
		font-size: 36rpx;
	}

	.action-text {
		font-size: 22rpx;
		color: #666;
	}

	.buy-btn {
		width: 280rpx;
		height: 80rpx;
		line-height: 80rpx;
		background: linear-gradient(135deg, #FF6600, #FF8C00);
		color: #fff;
		font-size: 30rpx;
		border-radius: 40rpx;
	}

	/* 收货地址弹窗 */
	.address-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.5);
		z-index: 999;
		display: flex;
		align-items: flex-end;
	}

	.address-form {
		width: 100%;
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		max-height: 85vh;
		overflow-y: auto;
	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		position: sticky;
		top: 0;
		background: #fff;
	}

	.form-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.form-close {
		font-size: 48rpx;
		color: #999;
		line-height: 1;
	}

	.form-body {
		padding: 30rpx;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.form-label {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 15rpx;
	}

	.form-input {
		width: 100%;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1rpx solid #ddd;
		border-radius: 12rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.form-picker {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1rpx solid #ddd;
		border-radius: 12rpx;
		font-size: 28rpx;
	}

	.form-picker .placeholder {
		color: #999;
	}

	.picker-arrow {
		font-size: 32rpx;
		color: #999;
	}

	.form-textarea {
		width: 100%;
		height: 160rpx;
		padding: 20rpx;
		border: 1rpx solid #ddd;
		border-radius: 12rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.form-footer {
		padding: 30rpx;
		border-top: 1rpx solid #eee;
		position: sticky;
		bottom: 0;
		background: #fff;
	}

	.product-summary {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 20rpx;
	}

	.summary-label {
		font-size: 28rpx;
		color: #666;
	}

	.summary-price {
		font-size: 36rpx;
		font-weight: bold;
		color: #ff6600;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: linear-gradient(135deg, #FF6600, #FF8C00);
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
	}

	/* 订单确认弹窗 */
	.confirm-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.confirm-content {
		width: 90%;
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
	}

	.confirm-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.confirm-close {
		font-size: 48rpx;
		color: #999;
		line-height: 1;
	}

	.confirm-body {
		padding: 30rpx;
	}

	.confirm-item {
		display: flex;
		justify-content: space-between;
		padding: 15rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.confirm-item:last-child {
		border-bottom: none;
	}

	.confirm-label {
		font-size: 28rpx;
		color: #666;
	}

	.confirm-value {
		font-size: 28rpx;
		color: #333;
		max-width: 70%;
		text-align: right;
	}

	.confirm-price {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff6600;
	}

	.confirm-footer {
		padding: 30rpx;
		background: #fafafa;
	}

	.pay-amount {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 20rpx;
		font-size: 28rpx;
		color: #666;
	}

	.pay-price {
		font-size: 40rpx;
		font-weight: bold;
		color: #ff6600;
	}

	.pay-btns {
		display: flex;
		gap: 20rpx;
	}

	.pay-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 28rpx;
		font-weight: bold;
		border: none;
	}

	.pay-btn.wechat {
		background: #07c160;
		color: #fff;
	}

	.pay-btn.alipay {
		background: #1677ff;
		color: #fff;
	}
</style>
