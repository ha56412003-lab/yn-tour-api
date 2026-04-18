// 海报背景图管理API
const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const Background = require('../models/Background')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 配置上传目录
const uploadDir = path.join(__dirname, '../uploads/backgrounds')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

// 获取背景图列表（管理后台用）
router.get('/list', async (req, res) => {
  try {
    const list = await Background.find().sort({ sort: 1, createdAt: -1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取启用列表（小程序海报随机选取）
router.get('/enabled', async (req, res) => {
  try {
    const list = await Background.find({ status: 1 }).sort({ sort: 1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 上传背景图
router.post('/upload', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '请选择图片' })
    }
    const { name, sort } = req.body
    const url = `/api/uploads/backgrounds/${req.file.filename}`

    const bg = await Background.create({
      name: name || '',
      url,
      status: 1,
      sort: parseInt(sort) || 0
    })

    res.json({ code: 200, data: bg, message: '上传成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 批量上传
router.post('/upload-batch', upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({ code: 400, message: '请选择图片' })
    }
    const { name } = req.body
    const items = req.files.map((file, index) => ({
      name: name || '',
      url: `/api/uploads/backgrounds/${file.filename}`,
      status: 1,
      sort: index
    }))

    const result = await Background.insertMany(items)
    res.json({ code: 200, data: result, message: `成功上传${result.length}张` })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 更新背景图信息
router.post('/update', adminAuth, async (req, res) => {
  try {
    const { backgroundId, name, sort, status } = req.body
    const updates = {}
    if (name !== undefined) updates.name = name
    if (sort !== undefined) updates.sort = parseInt(sort)
    if (status !== undefined) updates.status = parseInt(status)

    const bg = await Background.findByIdAndUpdate(backgroundId, updates, { new: true })
    if (!bg) return res.json({ code: 404, message: '背景图不存在' })

    res.json({ code: 200, data: bg, message: '更新成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 删除背景图
router.post('/delete', adminAuth, async (req, res) => {
  try {
    const { backgroundId } = req.body
    const bg = await Background.findByIdAndDelete(backgroundId)
    if (!bg) return res.json({ code: 404, message: '背景图不存在' })

    // 删除物理文件
    const filePath = path.join(__dirname, '..', bg.url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.json({ code: 200, message: '删除成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 批量删除
router.post('/delete-batch', adminAuth, async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({ code: 400, message: '请选择要删除的背景图' })
    }

    const bgs = await Background.find({ _id: { $in: ids } })
    for (const bg of bgs) {
      const filePath = path.join(__dirname, '..', bg.url)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await Background.deleteMany({ _id: { $in: ids } })
    res.json({ code: 200, message: `已删除${ids.length}张背景图` })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
