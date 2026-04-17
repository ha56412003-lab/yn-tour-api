// 首页装修配置API
const express = require('express')
const router = express.Router()
const HomeConfig = require('../models/HomeConfig')
const Product = require('../models/Product')

// 获取首页配置（小程序用）
router.get('/get', async (req, res) => {
  try {
    // 只取第一条配置
    let config = await HomeConfig.findOne().sort({ sort: -1 })
    if (!config) {
      // 没有配置时返回空
      return res.json({ code: 200, data: null })
    }
    // 如果有关联产品id，尝试补全产品信息
    if (config.linkedProductId) {
      const product = await Product.findById(config.linkedProductId)
      if (product) {
        config = config.toObject()
        config.linkedProduct = {
          _id: product._id,
          name: product.name,
          subtitle: product.subtitle,
          price: product.price,
          originalPrice: product.originalPrice,
          promotionPrice: product.promotionPrice,
          isPromotion: product.isPromotion,
          mainImages: product.mainImages,
          highlights: product.highlights
        }
      }
    }
    res.json({ code: 200, data: config })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取所有配置（管理后台用）
router.get('/list', async (req, res) => {
  try {
    const list = await HomeConfig.find().sort({ sort: -1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 保存/更新首页配置
router.post('/save', async (req, res) => {
  try {
    const { bannerImage, linkedProductId, linkedProductName, butlerPhones, butlerWechats } = req.body

    // 查找是否已有配置
    let config = await HomeConfig.findOne()
    if (config) {
      // 更新已有配置
      if (bannerImage !== undefined) config.bannerImage = bannerImage
      if (linkedProductId !== undefined) config.linkedProductId = linkedProductId
      if (linkedProductName !== undefined) config.linkedProductName = linkedProductName
      if (butlerPhones !== undefined) config.butlerPhones = butlerPhones
      if (butlerWechats !== undefined) config.butlerWechats = butlerWechats
      if (officialAccountUrl !== undefined) config.officialAccountUrl = officialAccountUrl
      config.updatedAt = new Date()
      await config.save()
    } else {
      // 创建新配置
      config = await HomeConfig.create({
        bannerImage: bannerImage || '',
        linkedProductId: linkedProductId || null,
        linkedProductName: linkedProductName || '',
        butlerPhones: butlerPhones || '',
        butlerWechats: butlerWechats || '',
        officialAccountUrl: officialAccountUrl || ''
      })
    }
    res.json({ code: 200, data: config })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 删除配置
router.post('/delete', async (req, res) => {
  try {
    const { configId } = req.body
    if (!configId) return res.json({ code: 400, message: '缺少configId' })
    await HomeConfig.findByIdAndDelete(configId)
    res.json({ code: 200, message: '删除成功' })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

// 获取可选产品列表（供管理后台选择）
router.get('/products', async (req, res) => {
  try {
    const list = await Product.find({ status: 1 }).select('_id name subtitle price originalPrice promotionPrice isPromotion images highlights').sort({ sort: -1 })
    res.json({ code: 200, data: list })
  } catch (err) {
    res.json({ code: 500, message: err.message })
  }
})

module.exports = router
