// 订单模型
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  orderNo: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // 商品信息
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  // 出行信息
  travelers: [{
    name: String,
    phone: String,
    idCard: String
  }],
  travelDate: { type: Date },
  // 收货地址（旅游卡实物邮寄）
  deliveryAddress: {
    receiverName: String,
    receiverPhone: String,
    province: String,
    city: String,
    district: String,
    detailAddress: String,
    fullAddress: String
  },
  // 发货状态: unpaid-未付款, paid-已付款待发货, shipped-已发货, completed-已收货
  deliveryStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'shipped', 'completed'],
    default: 'unpaid'
  },
  // 物流信息
  expressCompany: String,  // 快递公司
  expressNo: String,       // 快递单号
  shippedAt: Date,         // 发货时间
  completedAt: Date,      // 收货时间
  // 订单状态: pending-待支付, paid-已支付, processing-处理中, completed-已完成, cancelled-已取消
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'processing', 'completed', 'cancelled'],
    default: 'pending' 
  },
  // 支付信息
  paymentMethod: { type: String, enum: ['wechat', 'alipay'] },
  paidAt: { type: Date },
  transactionId: { type: String }, // 第三方支付交易号
  // 279分销机制相关
  distribution: {
    // 订单是否计入分销（用户自己购买的第一单）
    isSelfOrder: { type: Boolean, default: false },
    // 推荐人（上级分销商）
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // 是否锁客订单
    isLockedOrder: { type: Boolean, default: false },
    // 直推分润金额
    directProfit: { type: Number, default: 0 },
    // 成团奖（如果有）
    groupBonus: { type: Number, default: 0 },
    // 该订单对推荐人来说是第几单
    referrerOrderIndex: { type: Number, default: 0 }
  },
  // 分销佣金（兼容旧字段，同时扩展新字段）
  commission: {
    level1: { type: Number, default: 0 }, // 一级分销佣金
    level2: { type: Number, default: 0 }, // 二级分销佣金
    level1DistributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    level2DistributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    settled: { type: Boolean, default: false } // 是否已结算
  },
  // 退款相关
  refundStatus: {
    type: String,
    enum: ['none', 'applying', 'approved', 'rejected'],
    default: 'none'
  },
  refundApplyTime: { type: Date },
  refundReason: { type: String },
  refundRemark: { type: String },
  refundAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refundProcessedAt: { type: Date },
  // 佣金状态: frozen-冻结(退款保护期), released-已解冻, clawed_back-已追回
  commissionStatus: {
    type: String,
    enum: ['frozen', 'released', 'clawed_back'],
    default: 'frozen'
  },
  // 备注
  remark: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// 生成订单号
orderSchema.statics.generateOrderNo = function() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `YN${y}${m}${d}${random}`
}

module.exports = mongoose.model('Order', orderSchema)
