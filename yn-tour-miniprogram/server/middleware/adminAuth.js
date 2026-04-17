/**
 * 管理后台鉴权中间件
 * 校验 x-admin-token 请求头
 * 使用方式：在路由文件顶部 router.use(adminAuth) 即可
 */

const ADMIN_TOKEN = process.env.ADMIN_SECRET || 'haha-admin-2026'

function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token']
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ code: 401, message: '未授权，请联系管理员' })
  }
  next()
}

module.exports = adminAuth
