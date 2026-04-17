// 用户相关API
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const DistributionService = require('../services/DistributionService')
const Background = require('../models/Background')
const userAuth = require('../middleware/userAuth')
const https = require('https')

const JWT_SECRET = process.env.JWT_SECRET || 'haha-jwt-secret-2026'

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

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
      data: {
        user,
        token: signToken(user._id.toString())
      }
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
      data: {
        user,
        token: signToken(user._id.toString())
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})


// 成为分销商
router.post('/become-distributor', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const result = await DistributionService.becomeDistributor(userId)
    
    res.json(result)
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取用户收益统计（279机制）
router.get('/earnings', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
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
router.get('/calculate-withdraw', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
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
router.get('/commission-list', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const { page = 1, limit = 20 } = req.query
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
    const { limit = 10, period = 'all' } = req.query
    const ranking = await DistributionService.getTeamRanking(parseInt(limit), period)
    res.json({ code: 200, data: ranking })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取我的团队信息
router.get('/my-team', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
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
router.get('/share-code', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
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
router.get('/generate-poster', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
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
router.get('/qrcode', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
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
router.get('/poster-image', userAuth, async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
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
    // 海报组成：背景图 + 淡绿色叠加层 + 右下角二维码
    // =============================================
    const W = 540
    const H = 886

    // 加载背景图（优先从数据库随机选，fallback到文件系统）
    let bgImage = null
    try {
      const enabledBgs = await Background.find({ status: 1 })
      if (enabledBgs && enabledBgs.length > 0) {
        const randomBg = enabledBgs[Math.floor(Math.random() * enabledBgs.length)]
        const bgPath = path.join(__dirname, '..', randomBg.url.replace('/api', ''))
        bgImage = await Jimp.read(bgPath)
      } else {
        // fallback到文件系统
        const bgDir = path.join(__dirname, '../uploads/backgrounds')
        const bgFiles = fs.readdirSync(bgDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f))
        if (bgFiles.length === 0) {
          return res.json({ code: 500, message: '暂无背景图，请先上传' })
        }
        const bgFile = bgFiles[Math.floor(Math.random() * bgFiles.length)]
        bgImage = await Jimp.read(path.join(bgDir, bgFile))
      }
    } catch (e) {
      console.error('生成海报背景图失败:', e.message)
      return res.json({ code: 500, message: '背景图加载失败，请联系管理员' })
    }
    bgImage.resize({ w: W, h: H })
    const poster = bgImage

    // 淡绿色叠加层（轻微调色，不遮挡背景）
    const overlay = new Jimp({ width: W, height: H, color: 0x300a6744 })
    poster.composite(overlay, 0, 0)

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
