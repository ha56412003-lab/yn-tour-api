// 用户模型
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  openid: { type: String, required: true, unique: true },
  nickname: { type: String, default: '用户' },
  avatar: { type: String, default: '' },
  phone: { type: String },
  // 分销相关
  isDistributor: { type: Boolean, default: false },
  distributorLevel: { type: Number, default: 0 }, // 0: 普通用户, 1: 分销商
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 上级分销商
  // 279分销机制新增字段
  selfOrderNum: { type: Number, default: 0 },        // 自己购买单量
  directPushNum: { type: Number, default: 0 },       // 原直推单量（未锁客）
  lockedUserOrderNum: { type: Number, default: 0 },  // 锁客用户下单单量
  validVisitNum: { type: Number, default: 0 },       // 有效访问次数（当日）
  lastVisitAwardDate: { type: Date },                 // 最后一次获得访问奖励的日期
  // 导入分销相关
  isImported: { type: Boolean, default: false },    // 是否导入用户
  importOrderNo: { type: String },                   // 导入订单号
  importSource: { type: String },                   // 导入来源平台
  importedAt: { type: Date },                       // 导入时间
  // 是否被锁客
  isLocked: { type: Boolean, default: false },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 锁客的上级
  lockedAt: { type: Date },
  // 收益
  totalEarnings: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  frozenBalance: { type: Number, default: 0 },
  // 统计
  directOrders: { type: Number, default: 0 },   // 直推订单数
  indirectOrders: { type: Number, default: 0 }, // 间推订单数
  teamCount: { type: Number, default: 0 },      // 团队人数
  totalTeamOrders: { type: Number, default: 0 }, // 团队总单量（自己+直推）
  groupNum: { type: Number, default: 0 },         // 成团数
  // 签到
  signInDays: { type: Number, default: 0 },
  lastSignInDate: { type: Date },
  // 提现账户信息
  withdrawAccount: {
    // 微信
    wechatOpenid: { type: String },
    // 支付宝
    alipayAccount: { type: String },
    alipayName: { type: String },
    // 银行卡
    bankName: { type: String },
    bankAccount: { type: String },
    bankAccountName: { type: String }
  },
  // 状态
  status: { type: Number, default: 1 }, // 1: 正常, 0: 禁用
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)
