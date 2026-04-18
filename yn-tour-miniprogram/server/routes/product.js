// 商品相关API
const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const Product = require('../models/Product')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 配置文件上传
const uploadDir = path.join(__dirname, '../uploads/products')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// 获取商品列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    
    const query = status !== undefined ? { status: parseInt(status) } : {}
    
    const list = await Product.find(query)
      .sort({ sort: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
    
    const total = await Product.countDocuments(query)
    
    res.json({
      code: 200,
      data: {
        list,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取商品详情
router.get('/detail', async (req, res) => {
  try {
    const { productId } = req.query
    
    const product = await Product.findById(productId)
    
    if (!product) {
      return res.json({ code: 404, message: '商品不存在' })
    }
    
    res.json({
      code: 200,
      data: product
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取首页推荐商品
router.get('/recommend', async (req, res) => {
  try {
    const { limit = 5 } = req.query
    
    const list = await Product.find({ status: 1 })
      .sort({ sort: 1 })
      .limit(parseInt(limit))
    
    res.json({
      code: 200,
      data: list
    })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取所有商品（管理后台用，不分页）
router.get('/all', async (req, res) => {
  try {
    const list = await Product.find({}).sort({ sort: 1, createdAt: -1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 创建商品（管理员）
router.post('/create', adminAuth, async (req, res) => {
  try {
    const data = req.body
    const product = await Product.create({
      ...data,
      updatedAt: new Date()
    })
    res.json({ code: 200, data: product, message: '创建成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 更新商品（管理员）
router.post('/update', adminAuth, async (req, res) => {
  try {
    const { productId, ...updates } = req.body
    updates.updatedAt = new Date()
    
    const product = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true }
    )
    
    if (!product) {
      return res.json({ code: 404, message: '商品不存在' })
    }
    
    res.json({ code: 200, data: product, message: '更新成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 删除商品（管理员）
router.post('/delete', adminAuth, async (req, res) => {
  try {
    const { productId } = req.body
    
    const product = await Product.findByIdAndDelete(productId)
    
    if (!product) {
      return res.json({ code: 404, message: '商品不存在' })
    }
    
    res.json({ code: 200, message: '删除成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 上下架切换（管理员）
router.post('/toggle-status', adminAuth, async (req, res) => {
  try {
    const { productId } = req.body
    
    const product = await Product.findById(productId)
    if (!product) {
      return res.json({ code: 404, message: '商品不存在' })
    }
    
    product.status = product.status === 1 ? 0 : 1
    product.updatedAt = new Date()
    await product.save()
    
    res.json({ code: 200, data: { status: product.status }, message: product.status === 1 ? '已上架' : '已下架' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 上传商品图片
router.post('/upload-image', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '请选择图片' })
    }
    const imageUrl = `/uploads/products/${req.file.filename}`
    res.json({ code: 200, data: { url: imageUrl }, message: '上传成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
