// 产品素材/花絮图片管理API
const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const Gallery = require('../models/Gallery')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 配置上传目录
const uploadDir = path.join(__dirname, '../uploads/gallery')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }) // 10MB

// 获取素材列表（管理后台用）
router.get('/list', async (req, res) => {
  try {
    const { category, status } = req.query
    const query = {}
    if (category) query.category = category
    if (status !== undefined) query.status = parseInt(status)

    const list = await Gallery.find(query).sort({ sort: 1, createdAt: -1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取素材列表（小程序用，只返回启用的）
router.get('/all', async (req, res) => {
  try {
    const { category } = req.query
    const query = { status: 1 }
    if (category) query.category = category

    const list = await Gallery.find(query).sort({ sort: 1, createdAt: -1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 按分类获取素材（小程序用）
router.get('/by-category', async (req, res) => {
  try {
    const categories = ['scene', 'food', 'hotel', 'experience']
    const result = {}
    for (const cat of categories) {
      result[cat] = await Gallery.find({ category: cat, status: 1 }).sort({ sort: 1 })
    }
    res.json({ code: 200, data: result })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 上传素材图片
router.post('/upload', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '请选择图片' })
    }
    const { category, title, location, scene, sort } = req.body
    const url = `/uploads/gallery/${req.file.filename}`

    const gallery = await Gallery.create({
      productId: null,
      category: category || 'scene',
      title: title || '',
      location: location || '',
      scene: scene || '',
      url,
      sort: parseInt(sort) || 0,
      status: 1
    })

    res.json({ code: 200, data: gallery, message: '上传成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 批量上传素材图片
router.post('/upload-batch', upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({ code: 400, message: '请选择图片' })
    }
    const { category } = req.body
    const items = req.files.map((file, index) => ({
      productId: null,
      category: category || 'scene',
      title: '',
      location: '',
      scene: '',
      url: `/uploads/gallery/${file.filename}`,
      sort: index,
      status: 1
    }))

    const result = await Gallery.insertMany(items)
    res.json({ code: 200, data: result, message: `成功上传${result.length}张图片` })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 更新素材信息
router.post('/update', adminAuth, async (req, res) => {
  try {
    const { galleryId, category, title, location, scene, sort, status } = req.body
    const updates = { updatedAt: new Date() }
    if (category !== undefined) updates.category = category
    if (title !== undefined) updates.title = title
    if (location !== undefined) updates.location = location
    if (scene !== undefined) updates.scene = scene
    if (sort !== undefined) updates.sort = parseInt(sort)
    if (status !== undefined) updates.status = parseInt(status)

    const gallery = await Gallery.findByIdAndUpdate(galleryId, updates, { new: true })
    if (!gallery) return res.json({ code: 404, message: '素材不存在' })

    res.json({ code: 200, data: gallery, message: '更新成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 删除素材
router.post('/delete', adminAuth, async (req, res) => {
  try {
    const { galleryId } = req.body
    const gallery = await Gallery.findByIdAndDelete(galleryId)
    if (!gallery) return res.json({ code: 404, message: '素材不存在' })

    // 删除物理文件
    const filePath = path.join(__dirname, '..', gallery.url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.json({ code: 200, message: '删除成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 批量删除素材
router.post('/delete-batch', adminAuth, async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({ code: 400, message: '请选择要删除的素材' })
    }

    const galleries = await Gallery.find({ _id: { $in: ids } })
    // 删除物理文件
    for (const g of galleries) {
      const filePath = path.join(__dirname, '..', g.url)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await Gallery.deleteMany({ _id: { $in: ids } })
    res.json({ code: 200, message: `已删除${ids.length}张素材` })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
