// 服务端入口
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const cron = require('node-cron')
require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const userRoutes = require('./routes/user')
const orderRoutes = require('./routes/order')
const productRoutes = require('./routes/product')
const withdrawRoutes = require('./routes/withdraw')
const adminRoutes = require('./routes/admin')
const importRoutes = require('./routes/import')
const authRoutes = require('./routes/auth')
const galleryRoutes = require('./routes/gallery')
const homeConfigRoutes = require('./routes/homeConfig')
const backgroundRoutes = require('./routes/background')
const reviewRoutes = require('./routes/review')
const refundRoutes = require('./routes/refund')
const itineraryRoutes = require('./routes/itinerary')
const announcementRoutes = require('./routes/announcement')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务（上传的图片）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 后台管理页面静态文件
app.use('/admin', express.static(path.join(__dirname, '../admin-web')))

// 路由
app.use('/api/user', userRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/product', productRoutes)
app.use('/api/withdraw', withdrawRoutes)
app.use('/api/admin/announcement', announcementRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/import', importRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/homeConfig', homeConfigRoutes)
app.use('/api/background', backgroundRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/itinerary', itineraryRoutes)
app.use('/api/refund', refundRoutes)
app.use('/api/announcement', announcementRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yn-tour'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 连接成功')
    // 初始化商品数据
    initProducts()
  })
  .catch(err => {
    console.error('❌ MongoDB 连接失败:', err.message)
  })

// 初始化商品数据
async function initProducts() {
  const Product = require('./models/Product')
  
  const count = await Product.countDocuments()
  if (count > 0) {
    console.log('📦 商品数据已存在，跳过初始化')
    return
  }
  
  await Product.create({
    name: '云南6天5晚 · 深度纯玩游',
    subtitle: '昆明大理丽江 · 洱海 · 玉龙雪山 · 泸沽湖',
    description: '全程无购物，纯玩团，专车接送',
    images: [
      '/static/product1.jpg',
      '/static/product2.jpg',
      '/static/product3.jpg'
    ],
    price: 799,
    originalPrice: 2999,
    duration: '6天5晚',
    destinations: ['昆明', '大理', '丽江', '泸沽湖'],
    itinerary: [
      { day: 1, title: '抵达昆明', description: '专车接机，入住酒店' },
      { day: 2, title: '昆明 → 大理', description: '游览滇池、洱海骑行' },
      { day: 3, title: '大理 → 丽江', description: '大理古城、丽江古城' },
      { day: 4, title: '丽江', description: '玉龙雪山、蓝月谷' },
      { day: 5, title: '丽江 → 泸沽湖', description: '泸沽湖环湖、摩梭篝火' },
      { day: 6, title: '返程', description: '泸沽湖送机，结束行程' }
    ],
    feeInclude: [
      '5晚特色酒店住宿',
      '行程中全程用车',
      '景区门票（玉龙雪山含索道）',
      '导游服务',
      '旅游意外险'
    ],
    feeExclude: [
      '往返大交通（机票/火车票）',
      '个人消费',
      '行程中自选项目'
    ],
    commission: {
      level1: 0.3,
      level2: 0.7
    },
    status: 1,
    sort: 1
  })
  
  console.log('📦 初始化商品数据完成')
}

/**
 * 定时任务：每天凌晨 00:05 自动检查并释放满30天保护期的冻结佣金
 * 防止用户长期不申请提现时，佣金永远卡在 frozenBalance
 */
async function runDailyCommissionRelease() {
  try {
    const User = require('./models/User')
    const Commission = require('./models/Commission')
    const DistributionService = require('./services/DistributionService')

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // 找出所有有冻结佣金且已过30天的用户
    const overdueUsers = await Commission.aggregate([
      { $match: { status: 'frozen', frozenAt: { $lte: thirtyDaysAgo } } },
      { $group: { _id: '$userId' } }
    ])

    let totalReleased = 0
    for (const { _id: userId } of overdueUsers) {
      const result = await DistributionService.checkAndReleaseFrozenCommissions(userId)
      totalReleased += result.released || 0
    }

    if (totalReleased > 0) {
      console.log(`[佣金定时释放] 共释放 ${totalReleased} 笔佣金，涉及 ${overdueUsers.length} 位用户`)
    }
  } catch (err) {
    console.error('[佣金定时释放] 执行失败:', err.message)
  }
}

// 服务启动时立即执行一次（处理遗漏）
runDailyCommissionRelease()

// 每天凌晨 00:05 执行
cron.schedule('5 0 * * *', () => {
  console.log('[定时任务] 开始执行佣金自动释放检查...')
  runDailyCommissionRelease()
})

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`)
  console.log('📋 API接口清单:')
  console.log('   - 用户: /api/user/*')
  console.log('   - 订单: /api/order/*')
  console.log('   - 商品: /api/product/*')
  console.log('   - 提现: /api/withdraw/*')
  console.log('   - 管理: /api/admin/*')
})

module.exports = app
