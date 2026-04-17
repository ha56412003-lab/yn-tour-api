/**
 * 用户 JWT 鉴权中间件
 * 验证 x-user-token 请求头
 * 使用方式：在需要验证用户身份的路由上加上 userAuth(req, res, next)
 */

const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'haha-jwt-secret-2026'

function userAuth(req, res, next) {
  const token = req.headers['x-user-token']
  if (!token) {
    return res.status(401).json({ code: 401, message: '请先登录' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.headers['x-user-id'] = decoded.userId
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' })
    }
    return res.status(401).json({ code: 401, message: '无效的登录凭证' })
  }
}

module.exports = userAuth
