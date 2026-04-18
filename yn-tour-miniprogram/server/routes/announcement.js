const express = require('express')
const router = express.Router()
const adminAuth = require('../middleware/adminAuth')
const Announcement = require('../models/Announcement')

// ========== 小程序端接口 ==========

// GET /api/announcement/popup - 获取当前应显示的弹窗公告
router.get('/popup', async (req, res) => {
  try {
    const now = new Date()
    const announcement = await Announcement.findOne({
      type: 'popup',
      status: 1,
      $or: [
        { showStart: null, showEnd: null },
        { showStart: { $lte: now }, showEnd: null },
        { showStart: null, showEnd: { $gte: now } },
        { showStart: { $lte: now }, showEnd: { $gte: now } }
      ]
    }).sort({ priority: -1, createdAt: -1 }).lean()

    if (!announcement) {
      return res.json({ code: 200, message: '无弹窗公告', data: null })
    }

    res.json({ code: 200, message: '获取成功', data: announcement })
  } catch (err) {
    console.error('获取弹窗公告失败:', err)
    res.json({ code: 500, message: '服务器错误', data: null })
  }
})

// ========== 管理端接口 ==========

// GET /api/admin/announcement/list - 列表（含分页）
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query
    const filter = {}
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ]
    }
    const skip = (parseInt(page) - 1) * parseInt(pageSize)
    const [list, total] = await Promise.all([
      Announcement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(pageSize)).lean(),
      Announcement.countDocuments(filter)
    ])
    res.json({
      code: 200,
      message: '获取成功',
      data: { list, total, page: parseInt(page), pageSize: parseInt(pageSize) }
    })
  } catch (err) {
    console.error('获取公告列表失败:', err)
    res.json({ code: 500, message: '服务器错误', data: null })
  }
})

// POST /api/admin/announcement/create - 新建
router.post('/create', adminAuth, async (req, res) => {
  try {
    const { title, content, type, status, showStart, showEnd, bgColor, textColor, priority } = req.body
    const announcement = await Announcement.create({
      title: title || '',
      content: content || '',
      type: type || 'popup',
      status: status !== undefined ? parseInt(status) : 1,
      showStart: showStart ? new Date(showStart) : null,
      showEnd: showEnd ? new Date(showEnd) : null,
      bgColor: bgColor || '#ffffff',
      textColor: textColor || '#333333',
      priority: parseInt(priority) || 0
    })
    res.json({ code: 200, message: '创建成功', data: announcement })
  } catch (err) {
    console.error('创建公告失败:', err)
    res.json({ code: 500, message: '服务器错误', data: null })
  }
})

// POST /api/admin/announcement/update - 更新
router.post('/update', adminAuth, async (req, res) => {
  try {
    const { id, title, content, type, status, showStart, showEnd, bgColor, textColor, priority } = req.body
    const updateData = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status: parseInt(status) }),
      ...(showStart !== undefined && { showStart: showStart ? new Date(showStart) : null }),
      ...(showEnd !== undefined && { showEnd: showEnd ? new Date(showEnd) : null }),
      ...(bgColor !== undefined && { bgColor }),
      ...(textColor !== undefined && { textColor }),
      ...(priority !== undefined && { priority: parseInt(priority) }),
      updatedAt: new Date()
    }
    await Announcement.findByIdAndUpdate(id, updateData)
    res.json({ code: 200, message: '更新成功', data: null })
  } catch (err) {
    console.error('更新公告失败:', err)
    res.json({ code: 500, message: '服务器错误', data: null })
  }
})

// DELETE /api/admin/announcement/:id - 删除
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id)
    res.json({ code: 200, message: '删除成功', data: null })
  } catch (err) {
    console.error('删除公告失败:', err)
    res.json({ code: 500, message: '服务器错误', data: null })
  }
})

module.exports = router
