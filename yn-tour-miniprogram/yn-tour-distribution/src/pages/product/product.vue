<template>
	<view class="product">
		<!-- 图片轮播 - 主图 -->
		<swiper class="swiper" indicator-dots autoplay circular>
			<swiper-item v-for="(img, idx) in (productData?.mainImages?.length ? productData.mainImages : ['/static/product1.jpg'])" :key="idx">
				<image :src="fullImageUrl(img)" mode="widthFix" />
			</swiper-item>
			<swiper-item v-if="!productData?.mainImages?.length">
				<image src="/static/product1.jpg" mode="widthFix" />
			</swiper-item>
		</swiper>

		<!-- 价格区域 - 动态 -->
		<view class="price-section">
			<view class="price-row">
				<text class="price-symbol">¥</text>
				<text class="price-value">{{ displayPrice }}</text>
				<text class="price-unit">/套</text>
			</view>
			<view class="original-price" v-if="productData?.originalPrice">原价: ¥{{ productData.originalPrice }}</view>
		</view>

		<!-- 产品标题 - 动态 -->
		<view class="product-section">
			<view class="product-title">{{ productData?.name || '加载中...' }}</view>
			<view class="product-subtitle">{{ productData?.subtitle || '' }}</view>
			<view class="product-tags" v-if="productData?.highlights?.length">
				<text class="tag" v-for="(h, i) in productData.highlights" :key="i">{{ h.icon }} {{ h.text }}</text>
			</view>
		</view>

		<!-- 行程安排 - 动态 -->
		<view class="product-section" v-if="productData?.itinerary?.length">
			<view class="section-title">📍 行程安排</view>
			<view class="trip-item" v-for="(day, i) in productData.itinerary" :key="i">
				<view class="trip-day">{{ day.title || `Day ${day.day}` }}</view>
				<view class="trip-content">
					<text class="trip-city">{{ day.description }}</text>
					<view class="trip-tags" v-if="day.tags?.length">
						<text class="trip-tag" v-for="(tag, ti) in day.tags" :key="ti">{{ tag }}</text>
					</view>
					<view class="trip-meals" v-if="day.meals">餐: {{ day.meals }}</view>
				</view>
			</view>
		</view>

		<!-- 费用说明 - 动态 -->
		<view class="product-section">
			<view class="section-title">💰 费用说明</view>
			<view class="fee-include" v-if="productData?.feeInclude?.length">
				<view class="fee-title">✅ 费用包含</view>
				<view class="fee-item" v-for="(item, i) in productData.feeInclude" :key="i">• {{ item }}</view>
			</view>
			<view class="fee-exclude" v-if="productData?.feeExclude?.length">
				<view class="fee-title">❌ 费用不含</view>
				<view class="fee-item" v-for="(item, i) in productData.feeExclude" :key="i">• {{ item }}</view>
			</view>
		</view>

		<!-- 出行须知 - 动态 -->
		<view class="product-section" v-if="productData?.notices?.length">
			<view class="section-title">📝 出行须知</view>
			<view class="notice-item" v-for="(notice, i) in productData.notices" :key="i">• {{ notice }}</view>
		</view>

		<!-- 产品详情图 -->
		<view class="product-section" v-if="productData?.detailImages?.length">
			<view class="section-title">📸 详情</view>
			<image
				v-for="(img, i) in productData.detailImages"
				:key="i"
				:src="fullImageUrl(img)"
				mode="widthFix"
				style="width:100%;display:block;margin-bottom:8rpx;"
			/>
		</view>

		<!-- 预约流程 - 静态引导 -->
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
					<view class="step-text">扫卡片上的二维码
添加专属管家预约出行</view>
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
						<text class="summary-price">¥{{ displayPrice }}</text>
					</view>
					<button class="submit-btn" @click="submitOrder">提交订单</button>
				</view>
			</view>
		</view>

		<!-- 订单确认弹窗 - 动态 -->
		<view class="confirm-modal" v-if="showConfirm" @click="showConfirm = false">
			<view class="confirm-content" @click.stop>
				<view class="confirm-header">
					<text>订单确认</text>
					<text class="confirm-close" @click="showConfirm = false">✕</text>
				</view>
				<view class="confirm-body">
					<view class="confirm-item">
						<text class="confirm-label">商品</text>
						<text class="confirm-value">{{ productData?.name || '加载中...' }}</text>
					</view>
					<view class="confirm-item">
						<text class="confirm-label">数量</text>
						<text class="confirm-value">1套</text>
					</view>
					<view class="confirm-item">
						<text class="confirm-label">金额</text>
						<text class="confirm-price">¥{{ displayPrice }}</text>
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
						<text class="pay-price">¥{{ displayPrice }}</text>
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { getProductDetail, getProductList } from '../../api/product'
import { createOrder } from '../../api/order'
import { BASE_URL } from '../../utils/request'

const userStore = useUserStore()

const productData = ref<any>(null)
const currentProductId = ref('')
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

// 动态价格：促销价优先于原价
const displayPrice = computed(() => {
  if (!productData.value) return '—'
  if (productData.value.isPromotion && productData.value.promotionPrice) {
    return productData.value.promotionPrice
  }
  return productData.value.price || '—'
})

// 图片URL处理（兼容相对路径和绝对路径）
function fullImageUrl(path) {
  if (!path) return '/static/product1.jpg'
  if (path.startsWith('http')) return path
  const base = 'http://192.168.10.14:3000'
  return path.startsWith('/') ? base + path : base + '/' + path
}

onLoad(async (options) => {
  if (options?.productId) {
    currentProductId.value = options.productId
    loadProductDetail(options.productId)
  } else {
    // 未传 productId，则自动获取第一个商品
    try {
      const res = await getProductList({ limit: 1, status: 1 })
      if (res.code === 200 && res.data.list.length > 0) {
        const firstProduct = res.data.list[0]
        currentProductId.value = firstProduct._id
        loadProductDetail(firstProduct._id)
      }
    } catch (e) {
      console.error('加载商品失败', e)
    }
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
  return userStore.state.userId || ''
}

function getCurrentProductId() {
  return currentProductId.value || null
}

const contactService = () => {
  uni.showToast({ title: '联系客服：400-888-8888', icon: 'none' })
}

const shareProduct = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
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
  showAddress.value = false
  showConfirm.value = true
}

const doPay = async (payMethod) => {
  const productId = getCurrentProductId()
  if (!productId) {
    uni.hideLoading()
    uni.showToast({ title: '产品信息加载中，请稍后重试', icon: 'none' })
    return
  }

  uni.showLoading({ title: '创建订单...' })

  try {
    const orderData = {
      userId: getCurrentUserId(),
      productId: productId,
      quantity: 1,
      travelers: [{
        name: address.value.name,
        phone: address.value.phone,
        idCard: ''
      }],
      travelDate: '2099-12-31',
      deliveryAddress: {
        receiverName: address.value.name,
        receiverPhone: address.value.phone,
        province: address.value.province,
        city: address.value.city,
        district: address.value.district,
        detailAddress: address.value.detail,
        fullAddress: `${address.value.province}${address.value.city}${address.value.district}${address.value.detail}`
      }
    }

    const orderRes = await createOrder(orderData)
    uni.hideLoading()

    if (orderRes.code === 200) {
      const orderId = orderRes.data._id
      // 模拟支付
      const payRes = await mockPay({ orderId, paymentMethod: payMethod })
      if (payRes.code === 200) {
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

// mock支付函数（本地模拟）
async function mockPay(data: { orderId: string; paymentMethod: string }) {
  return new Promise((resolve) => {
    uni.request({
      url: BASE_URL + '/order/mock-pay',
      method: 'POST',
      data,
      success: (res: any) => resolve(res.data),
      fail: () => resolve({ code: 500, message: '请求失败' })
    })
  })
}
</script>

<style lang="scss">
.product {
	padding-bottom: 220rpx;
	background: #f5f5f5;
}

.swiper {
	width: 750rpx;
	height: 750rpx;
	overflow: hidden;
}
.swiper image {
	width: 100%;
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

.trip-item {
	display: flex;
	margin-bottom: 24rpx;
}
.trip-day {
	width: 120rpx;
	padding: 8rpx 0;
	background: #2E8B57;
	color: #fff;
	font-size: 22rpx;
	text-align: center;
	border-radius: 8rpx;
	flex-shrink: 0;
	line-height: 1.4;
}
.trip-content {
	margin-left: 20rpx;
	flex: 1;
}
.trip-city {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
	display: block;
	margin-bottom: 6rpx;
}
.trip-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin-bottom: 4rpx;
}
.trip-tag {
	padding: 2rpx 8rpx;
	background: #f0f9f4;
	color: #2E8B57;
	font-size: 20rpx;
	border-radius: 4rpx;
}
.trip-meals {
	font-size: 22rpx;
	color: #999;
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

.notice-item {
	font-size: 26rpx;
	color: #666;
	line-height: 44rpx;
}

.flow-steps {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	overflow: hidden;
}
.step {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	min-width: 0;
}
.step-num {
	width: 56rpx;
	height: 56rpx;
	line-height: 56rpx;
	background: linear-gradient(135deg, #ff6600, #ff8c00);
	color: #fff;
	font-size: 26rpx;
	font-weight: bold;
	border-radius: 50%;
	text-align: center;
	margin-bottom: 8rpx;
	flex-shrink: 0;
}
.step-text {
	font-size: 20rpx;
	color: #666;
	text-align: center;
	word-break: break-all;
}
.step-arrow {
	font-size: 28rpx;
	color: #ccc;
	padding: 0 6rpx;
	flex-shrink: 0;
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
