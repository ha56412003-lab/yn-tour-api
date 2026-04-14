// 用户相关API
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const DistributionService = require('../services/DistributionService')
const VisitRecord = require('../models/VisitRecord')
const https = require('https')

// 获取用户信息
router.get('/info', async (req, res) => {
  try {
    const { openid, userId, phone } = req.query
    let user
    
    if (openid) {
      user = await User.findOne({ openid })
    } else if (userId) {
      user = await User.findById(userId)
    } else if (phone) {
      user = await User.findOne({ phone })
    }
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    res.json({
      code: 200,
      data: user
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 测试登录（手机号快速登录，用于H5测试）
router.post('/test-login', async (req, res) => {
  try {
    const { phone, nickname } = req.body
    
    let user = await User.findOne({ phone })
    
    if (user) {
      if (nickname) user.nickname = nickname
      await user.save()
    } else {
      user = await User.create({
        openid: 'test_' + phone,
        phone,
        nickname: nickname || '测试用户',
        avatar: '',
        isDistributor: true,
        distributorLevel: 1
      })
    }
    
    res.json({
      code: 200,
      data: user
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 微信登录 / 创建用户（直接传 openid，适用于有微信授权能力的情况）
router.post('/login', async (req, res) => {
  try {
    const { openid, nickname, avatar, parentId, referrerId } = req.body
    
    let user = await User.findOne({ openid })
    
    if (user) {
      if (nickname) user.nickname = nickname
      if (avatar) user.avatar = avatar
      await user.save()
    } else {
      user = await User.create({
        openid,
        nickname: nickname || '用户',
        avatar: avatar || '',
        isDistributor: true, // 测试阶段：新用户默认开通分销商
        distributorLevel: 1
      })
      
      const bindParentId = parentId || referrerId
      if (bindParentId) {
        await DistributionService.bindParent(user._id, bindParentId)
      }
    }
    
    res.json({
      code: 200,
      data: user
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 微信 code 换 openid 并登录
router.post('/wx-login', async (req, res) => {
  try {
    const { code, nickname, avatar, referrerId } = req.body
    
    const appId = process.env.WX_APP_ID
    const appSecret = process.env.WX_APP_SECRET
    
    let openid = 'mock_openid_' + code
    
    if (appId && appSecret && code && !code.startsWith('mock_')) {
      try {
        const wxApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
        const wxData = await wxGet(wxApiUrl)
        if (wxData.openid) {
          openid = wxData.openid
        }
      } catch (e) {
        console.error('微信 code 换 openid 失败:', e.message)
      }
    }
    
    let user = await User.findOne({ openid })
    
    if (user) {
      if (nickname) user.nickname = nickname
      if (avatar) user.avatar = avatar
      await user.save()
    } else {
      user = await User.create({
        openid,
        nickname: nickname || '微信用户',
        avatar: avatar || ''
      })
      
      if (referrerId) {
        await DistributionService.bindParent(user._id, referrerId)
      }
    }
    
    res.json({
      code: 200,
      data: user
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 成为分销商
router.post('/become-distributor', async (req, res) => {
  try {
    const { userId } = req.body
    const result = await DistributionService.becomeDistributor(userId)
    
    res.json(result)
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取用户收益统计（279机制）
router.get('/earnings', async (req, res) => {
  try {
    const { userId } = req.query
    const result = await DistributionService.getUserEarnings(userId)
    
    if (!result.success) {
      return res.json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      data: result.data
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 计算可提现金额（279机制）
router.get('/calculate-withdraw', async (req, res) => {
  try {
    const { userId } = req.query
    const user = await User.findById(userId)
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    const withdrawInfo = DistributionService.calcFinalWithdrawAmount(user)
    
    res.json({
      code: 200,
      data: withdrawInfo
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取收益明细
router.get('/commission-list', async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query
    const result = await DistributionService.getCommissionList(userId, parseInt(page), parseInt(limit))
    
    res.json({
      code: 200,
      data: result
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取团队排行榜
router.get('/team-ranking', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const ranking = await DistributionService.getTeamRanking(parseInt(limit))
    
    res.json({
      code: 200,
      data: ranking
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 每日签到
router.post('/sign-in', async (req, res) => {
  try {
    const { userId } = req.body
    const user = await User.findById(userId)
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (user.lastSignInDate && new Date(user.lastSignInDate).toDateString() === today.toDateString()) {
      return res.json({ code: 400, message: '今日已签到' })
    }
    
    let reward = 0
    const consecutiveDays = user.signInDays || 0
    
    if (consecutiveDays < 7) {
      reward = 0.5
    } else if (consecutiveDays < 14) {
      reward = 1
    } else if (consecutiveDays < 21) {
      reward = 2
    } else {
      reward = 5
    }
    
    user.signInDays = consecutiveDays + 1
    user.lastSignInDate = new Date()
    user.availableBalance = (user.availableBalance || 0) + reward
    await user.save()
    
    const Commission = require('../models/Commission')
    await Commission.create({
      userId: user._id,
      type: 'signIn',
      amount: reward,
      status: 'settled',
      settledAt: new Date(),
      description: `签到奖励 - 第${user.signInDays}天`
    })
    
    res.json({
      code: 200,
      data: {
        reward,
        consecutiveDays: user.signInDays
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 记录访问（用于有效访问奖）
router.post('/record-visit', async (req, res) => {
  try {
    const { userId, visitorId, targetType, targetId, referrerId, ip, userAgent } = req.body
    
    const visitRecord = await VisitRecord.create({
      userId,
      visitorId,
      targetType,
      targetId,
      referrerId,
      isValid: true,
      ip,
      userAgent,
      duration: 30
    })
    
    let awardResult = null
    if (referrerId) {
      awardResult = await DistributionService.calculateValidVisitAward(referrerId, visitRecord)
    }
    
    res.json({
      code: 200,
      data: {
        visitRecord,
        awardResult
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取我的团队信息
router.get('/my-team', async (req, res) => {
  try {
    const { userId } = req.query
    const user = await User.findById(userId)
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    const teamMembers = await User.find({ 
      $or: [
        { parentId: userId },
        { lockedBy: userId }
      ]
    }).select('nickname avatar selfOrderNum directPushNum lockedUserOrderNum totalTeamOrders groupNum createdAt')
    
    const teamStats = {
      totalMembers: teamMembers.length,
      totalOrders: teamMembers.reduce((sum, m) => sum + (m.totalTeamOrders || 0), 0),
      totalSelfOrders: teamMembers.reduce((sum, m) => sum + (m.selfOrderNum || 0), 0),
      totalDirectOrders: teamMembers.reduce((sum, m) => sum + (m.directPushNum || 0), 0),
      totalLockedOrders: teamMembers.reduce((sum, m) => sum + (m.lockedUserOrderNum || 0), 0)
    }
    
    res.json({
      code: 200,
      data: {
        myStats: {
          selfOrderNum: user.selfOrderNum || 0,
          directPushNum: user.directPushNum || 0,
          lockedUserOrderNum: user.lockedUserOrderNum || 0,
          totalDirectPushNum: (user.directPushNum || 0) + (user.lockedUserOrderNum || 0),
          totalTeamOrders: user.totalTeamOrders || 0,
          groupNum: user.groupNum || 0
        },
        teamMembers,
        teamStats
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取用户专属分享码
router.get('/share-code', async (req, res) => {
  try {
    const { userId } = req.query
    const user = await User.findById(userId)
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    const shareCode = Buffer.from(userId).toString('base64').replace(/=/g, '')
    
    const appId = process.env.WX_APP_ID
    const appSecret = process.env.WX_APP_SECRET
    let qrCodeUrl = ''
    
    if (appId && appSecret) {
      try {
        const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?appid=${appId}&secret=${appSecret}&grant_type=client_credential`
        const tokenData = await wxGet(tokenUrl)
        
        if (tokenData.access_token) {
          const qrUrl = `https://api.weixin.qq.com/wxa/getwxacode?access_token=${tokenData.access_token}`
          const qrData = await wxPost(qrUrl, {
            scene: `r=${userId}`,
            page: 'pages/home/home',
            width: 430,
            auto_color: false,
            line_color: { color: 'FF6B6B', width: 5 }
          })
          
          if (qrData && qrData.buffer) {
            const base64 = qrData.buffer.toString('base64')
            qrCodeUrl = `data:image/png;base64,${base64}`
          }
        }
      } catch (e) {
        console.error('生成小程序码失败:', e.message)
      }
    }
    
    res.json({
      code: 200,
      data: {
        shareCode,
        qrCodeUrl: qrCodeUrl || '',
        shareUrl: `/pages/home/home?referrerId=${userId}`,
        userId: userId
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 生成带小程序码的分享海报
router.get('/generate-poster', async (req, res) => {
  try {
    const { userId } = req.query
    const user = await User.findById(userId)
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    res.json({
      code: 200,
      data: {
        posterUrl: `/pages/share/poster?userId=${userId}&nickname=${encodeURIComponent(user.nickname)}`
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 辅助函数
function wxGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          resolve(data)
        }
      })
    }).on('error', reject)
  })
}

function wxPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }
    const req = https.request(url, options, (res) => {
      let rawData = []
      res.on('data', chunk => rawData.push(chunk))
      res.on('end', () => {
        const buffer = Buffer.concat(rawData)
        try {
          resolve(JSON.parse(buffer.toString()))
        } catch (e) {
          resolve({ buffer })
        }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

// 生成二维码（用于分享海报）
router.get('/qrcode', async (req, res) => {
  try {
    const { text, size = 150 } = req.query
    if (!text) {
      return res.json({ code: 400, message: 'text 参数不能为空' })
    }

    const QRCode = require('qrcode')
    const dataUrl = await QRCode.toDataURL(text, {
      width: parseInt(size),
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })

    res.json({ code: 200, data: dataUrl })
  } catch (err) {
    console.error('二维码生成失败:', err)
    res.json({ code: 500, message: '二维码生成失败' })
  }
})

// 生成完整海报图片（后端合成，绕过前端canvas问题）
// 修复：改用微信官方 wxacode.get API 生成小程序码
router.get('/poster-image', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.json({ code: 400, message: 'userId 参数不能为空' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }

    const { Jimp } = require('jimp')
    const fs = require('fs')
    const path = require('path')

    // =============================================
    // 第一步：获取微信 access_token
    // =============================================
    const appId = process.env.WX_APP_ID
    const appSecret = process.env.WX_APP_SECRET
    let wxBuffer = null

    if (appId && appSecret) {
      try {
        const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?appid=${appId}&secret=${appSecret}&grant_type=client_credential`
        const tokenData = await wxGet(tokenUrl)
        if (tokenData.access_token) {
          // 用微信官方接口生成小程序码（可被微信扫码识别）
          const qrUrl = `https://api.weixin.qq.com/wxa/getwxacode?access_token=${tokenData.access_token}`
          const qrData = await wxPost(qrUrl, {
            scene: `r=${userId}`,
            page: 'pages/home/home',
            width: 280,
            auto_color: false,
            line_color: { color: '0a6744', width: 5 }
          })
          if (qrData && qrData.buffer) {
            wxBuffer = qrData.buffer
          }
        }
      } catch (e) {
        console.error('微信小程序码生成失败:', e.message)
      }
    }

    // 如果微信接口失败，降级用 qrcode library 生成（仍用小程序路径）
    if (!wxBuffer) {
      const QRCode = require('qrcode')
      const shareUrl = `pages/home/home?referrerId=${userId}`
      wxBuffer = await QRCode.toBuffer(shareUrl, {
        width: 280,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      })
    }

    // =============================================
    // 第二步：绘制海报 (540 x 886 px)
    // 海报组成：背景图 + 绿色半透明叠加层 + 装饰色块 + 居中二维码
    // =============================================
    const W = 540
    const H = 886

    // 加载背景图
    const bgDir = path.join(__dirname, '../uploads/backgrounds')
    const bgFiles = fs.readdirSync(bgDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    const bgFile = bgFiles[Math.floor(Math.random() * bgFiles.length)]
    const bgPath = path.join(bgDir, bgFile)
    const bgImage = await Jimp.read(bgPath)
    bgImage.resize({ w: W, h: H })
    const poster = bgImage

    // 绿色半透明叠加层（让背景图变暗，绿一点）
    const overlay = new Jimp({ width: W, height: H, color: 0x780a6744 })
    poster.composite(overlay, 0, 0)

    // 右上角装饰（半透明白色方块）
    const deco1 = new Jimp({ width: 280, height: 280, color: 0x10ffffff })
    poster.composite(deco1, W - 160, -70)

    // 左下角装饰
    const deco2 = new Jimp({ width: 180, height: 180, color: 0x08ffffff })
    poster.composite(deco2, -50, H - 130)

    // 顶部装饰条
    const strip = new Jimp({ width: 80, height: 6, color: 0x50ffffff })
    poster.composite(strip, 44, 50)

    // 价格标签（金色方块）
    const priceBg = new Jimp({ width: 130, height: 130, color: 0xFFFFD700 })
    poster.composite(priceBg, (W - 130) / 2, 210)

    // 用户信息卡
    const cardBg = new Jimp({ width: W - 80, height: 88, color: 0x18ffffff })
    poster.composite(cardBg, 40, 380)

    // 昵称区域
    const nameBg = new Jimp({ width: 140, height: 30, color: 0xd0ffffff })
    poster.composite(nameBg, 135, 390)

    // 认证标签背景
    const badgeBg = new Jimp({ width: 110, height: 26, color: 0xbbFFD700 })
    poster.composite(badgeBg, 135, 428)

    // 分割线
    const line = new Jimp({ width: W - 80, height: 2, color: 0x30ffffff })
    poster.composite(line, 40, 495)

    // 引导文案区域背景
    const guideBg = new Jimp({ width: 240, height: 60, color: 0x12ffffff })
    poster.composite(guideBg, (W - 240) / 2, 500)

    // =============================================
    // 第三步：叠加二维码（右下角）
    // =============================================
    const qrImage = await Jimp.read(wxBuffer)
    const qrSize = 100
    qrImage.resize({ w: qrSize, h: qrSize })

    // 二维码白色背景（右下角，30px边距）
    const qrBgSize = qrSize + 20
    const qrBg = new Jimp({ width: qrBgSize, height: qrBgSize, color: 0xFFFFFFFF })
    const qrX = W - qrBgSize - 30  // 390
    const qrY = H - qrBgSize - 30  // 736
    poster.composite(qrBg, qrX, qrY)

    // 二维码本体（居中于白框）
    poster.composite(qrImage, qrX + 10, qrY + 10)

    // =============================================
    // 第四步：保存
    // =============================================
    const uploadDir = path.join(__dirname, '../uploads/posters')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const filename = `poster_${userId}.png`
    const filepath = path.join(uploadDir, filename)
    await poster.write(filepath)

    const posterUrl = `/uploads/posters/${filename}`
    console.log('海报生成成功:', posterUrl)
    res.json({ code: 200, data: { posterUrl } })
  } catch (err) {
    console.error('海报生成失败:', err)
    res.json({ code: 500, message: '海报生成失败: ' + err.message })
  }
})

module.exports = router
