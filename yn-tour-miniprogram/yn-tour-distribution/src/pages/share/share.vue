<template>
  <view class="container">
    <!-- 未登录提示 -->
    <view class="mask" v-if="!userStore.state.isLoggedIn">
      <view class="modal-card">
        <view class="modal-header-bar">
          <text class="tip-icon-large">🔒</text>
        </view>
        <view class="modal-body-center">
          <view class="tip-title">请先登录</view>
          <view class="tip-text">登录后可使用专属推广功能</view>
          <button class="btn-primary" @click="goToLogin">去登录</button>
        </view>
      </view>
    </view>

    <!-- 未成为分销商提示 -->
    <view class="mask" v-else-if="!userStore.state.isDistributor">
      <view class="modal-card">
        <view class="modal-header-green">
          <text class="header-title">专属推广</text>
          <view class="close-btn" @click="goBack">✕</view>
        </view>
        <view class="modal-body-center">
          <view class="tip-icon-large">🎁</view>
          <view class="tip-title">仅限分销商使用</view>
          <view class="tip-text">成为分销商后，即可生成专属推广海报和链接，锁客30天下单永久绑定，享受两级分销收益。</view>
          <button class="btn-primary" @click="goToJoin">立即申请开通</button>
        </view>
      </view>
    </view>

    <!-- 分享主页（分销商可见） -->
    <view class="mask" v-else>
      <view class="modal-card">
        <!-- 头部 -->
        <view class="modal-header-green">
          <view class="header-info">
            <text class="header-title">推广素材中心</text>
            <text class="header-sub">专属二维码 · 锁客神器</text>
          </view>
          <view class="close-btn" @click="goBack">✕</view>
        </view>

        <!-- 内容 -->
        <view class="modal-body">
          <!-- 用户信息条 -->
          <view class="user-bar">
            <image class="user-avatar" :src="userStore.state.avatar || '/static/avatar.png'" mode="aspectFill" />
            <view class="user-info">
              <text class="user-name">{{ userStore.state.nickname || '云南推客' }}</text>
              <view class="user-badge">
                <text class="badge-text">🌿 认证分销商</text>
              </view>
            </view>
          </view>

          <!-- 海报预览卡片 -->
          <view class="poster-card">
            <!-- 海报已生成：显示缩略图 -->
            <view v-if="posterUrl" class="poster-preview">
              <image class="poster-thumb" :src="posterUrl" mode="aspectFit" />
            </view>
            
            <!-- 海报未生成：只显示小按钮 -->
            <view v-else class="poster-empty">
              <view class="gen-btn" @click="generatePoster">
                <text class="gen-btn-icon">✨</text>
                <text class="gen-btn-text">生成专属推广海报</text>
              </view>
              <view class="gen-tip">生成后可保存图片分享到朋友圈</view>
            </view>
            
            <!-- 操作按钮 -->
            <view class="poster-actions">
              <view class="action-btn secondary" @click="copyLink">
                <text class="action-icon">📋</text>
                <text class="action-text">复制链接</text>
              </view>
              <view class="action-btn primary" @click="generatePoster" v-if="posterUrl">
                <text class="action-icon">🔄</text>
                <text class="action-text">重新生成</text>
              </view>
              <view class="action-btn success" @click="savePoster" v-if="posterUrl">
                <text class="action-icon">💾</text>
                <text class="action-text">保存海报</text>
              </view>
            </view>
          </view>

          <!-- 分享文案 -->
          <view class="share-text-section">
            <view class="section-label">📝 一键复制分享文案</view>
            <view class="share-text-card" @click="copyShareText">
              <text class="share-text-content">{{ shareText }}</text>
              <view class="copy-indicator">点击复制</view>
            </view>
          </view>

          <!-- 锁客说明 -->
          <view class="tips-section">
            <view class="tips-title">🔗 锁客机制</view>
            <view class="tips-grid">
              <view class="tip-item">
                <text class="tip-num">1</text>
                <view class="tip-content">
                  <text class="tip-label">扫码绑定</text>
                  <text class="tip-desc">好友扫码即建立上下级关系</text>
                </view>
              </view>
              <view class="tip-item">
                <text class="tip-num">2</text>
                <view class="tip-content">
                  <text class="tip-label">30天锁客</text>
                  <text class="tip-desc">点击链接30天内有效</text>
                </view>
              </view>
              <view class="tip-item">
                <text class="tip-num">3</text>
                <view class="tip-content">
                  <text class="tip-label">永久收益</text>
                  <text class="tip-desc">下单后永久绑定持续拿收益</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 全屏海报预览 -->
    <view class="preview-overlay" v-if="showPreview">
      <view class="preview-toolbar">
        <view class="toolbar-close" @click="showPreview = false">✕ 关闭</view>
      </view>
      <image class="preview-img" :src="posterUrl" mode="aspectFit" />
      <view class="preview-hint">长按图片保存到相册</view>
    </view>

    <!-- 加载中（可取消） -->
    <view class="loading-mask" v-if="loading">
      <view class="loading-box">
        <view class="spinner"></view>
        <text class="loading-label">{{ loadingTip }}</text>
        <view class="loading-cancel" @click="cancelGenerate">取消</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../store/user'
import { get, BASE_URL } from '../../utils/request'

const userStore = useUserStore()
const posterUrl = ref('')
const showPreview = ref(false)
const loading = ref(false)
const loadingTip = ref('')

// 生成推广链接
function getShareUrl() {
  const userId = userStore.state.userId
  if (!userId) return ''
  return `pages/home/home?referrerId=${userId}`
}

// 分享文案
const shareText = computed(() => {
  const url = getShareUrl()
  return `🔥 给大家分享一个靠谱云南旅行项目！
799元玩6天5晚，大理+丽江+雪山全包
不仅玩得好，还能自己开团赚收益
想轻松出行、多一份收入的朋友可以了解👇
${url}`
})

// 去登录
function goToLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

// 去申请分销商
function goToJoin() {
  uni.navigateTo({ url: '/pages/join/join' })
}

// 返回
function goBack() {
  uni.navigateBack()
}

// 点击海报区域
function handlePosterClick() {
  if (!posterUrl.value) {
    generatePoster()
  }
}

// 预览海报
function previewPoster() {
  if (posterUrl.value) {
    showPreview.value = true
  }
}

// 复制链接
function copyLink() {
  const url = getShareUrl()
  if (!url) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
  })
}

// 复制分享文案
function copyShareText() {
  uni.setClipboardData({
    data: shareText.value,
    success: () => uni.showToast({ title: '文案已复制', icon: 'none' })
  })
}

// ========== 核心：生成分享海报 ==========
async function generatePoster() {
  loading.value = true
  loadingTip.value = '正在生成海报...'
  console.log('[海报] 开始生成, userId:', userStore.state.userId)

  // 超时保护：20秒强制结束
  const timeout = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      uni.showToast({ title: '生成超时，请重试', icon: 'none' })
    }
  }, 20000)

  try {
    // 直接调用后端海报生成接口（后端用Jimp合成，绕过前端canvas问题）
    const userId = userStore.state.userId
    console.log('[海报] 请求后端生成海报, userId:', userId)
    
    const res = await new Promise((resolve, reject) => {
      uni.request({
        url: `${BASE_URL}/user/poster-image`,
        method: 'GET',
        data: { userId },
        timeout: 15000,
        success: (r) => resolve(r),
        fail: (err) => reject(err)
      })
    })
    
    console.log('[海报] 后端响应:', res.data)
    
    if (res.data.code === 200 && res.data.data.posterUrl) {
      // 拼接完整URL
      const posterFullUrl = res.data.data.posterUrl.startsWith('http')
        ? res.data.data.posterUrl
        : BASE_URL + res.data.data.posterUrl
      console.log('[海报] 海报生成成功:', posterFullUrl)
      posterUrl.value = posterFullUrl
      uni.showToast({ title: '海报生成成功', icon: 'none' })
    } else {
      throw new Error(res.data.message || '海报生成失败')
    }
  } catch (e) {
    console.error('[海报] 生成失败:', e)
    uni.showToast({ title: '生成失败: ' + (e?.message || '未知'), icon: 'none', duration: 2500 })
  } finally {
    clearTimeout(timeout)
    loading.value = false
  }
}

// 从后端获取二维码 base64
function getQRCodeBase64(text) {
  return new Promise(async (resolve, reject) => {
    console.log('[海报] getQRCodeBase64 开始, text:', text)
    try {
      const res = await get('/user/qrcode', { text, size: 150 })
      console.log('[海报] getQRCodeBase64 响应:', res)
      if (res.code === 200) {
        resolve(res.data)
      } else {
        reject(new Error('二维码生成失败: ' + (res.message || '')))
      }
    } catch (e) {
      console.error('[海报] 获取二维码失败:', e)
      reject(new Error('网络请求失败: ' + (e?.message || e?.errMsg || '未知')))
    }
    
    // 超时保护：8秒强制结束
    setTimeout(() => reject(new Error('请求超时')), 8000)
  })
}

// base64 转本地临时文件
function base64ToTempFile(base64Str) {
  return new Promise((resolve, reject) => {
    if (!base64Str) {
      resolve(null)
      return
    }
    const base64 = base64Str.replace(/^data:image\/\w+;base64,/, '')
    const buffer = wx.base64ToArrayBuffer(base64)
    const filePath = `${wx.env.USER_DATA_PATH}/poster_qr.png`
    wx.getFileSystemManager().writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success: () => resolve(filePath),
      fail: (err) => {
        console.error('写入二维码临时文件失败', err)
        resolve(null)
      }
    })
  })
}

// 创建背景图（纯色 + 文字，纯 canvas 绘制）
function createBgImage() {
  return new Promise((resolve) => {
    console.log('[海报] createBgImage 开始')
    const W = 540
    const H = 765
    const canvas = wx.createCanvasContext('posterCanvas')
    console.log('[海报] canvasContext:', canvas)
    
    // 纯色背景（替代渐变，小程序不支持 createLinearGradient）
    canvas.setFillStyle('#0a6744')
    canvas.fillRect(0, 0, W, H)
    console.log('[海报] 背景填充完成')
    
    // 右上角装饰圆
    canvas.setFillStyle('rgba(255,255,255,0.08)')
    canvas.beginPath()
    canvas.arc(W - 60, 60, 120, 0, 2 * Math.PI)
    canvas.fill()
    console.log('[海报] 右上角装饰圆完成')
    
    // 左下角装饰圆
    canvas.setFillStyle('rgba(0,0,0,0.06)')
    canvas.beginPath()
    canvas.arc(80, H - 80, 100, 0, 2 * Math.PI)
    canvas.fill()
    console.log('[海报] 左下角装饰圆完成')
    
    // 顶部装饰线
    canvas.setFillStyle('rgba(255,255,255,0.15)')
    canvas.fillRect(40, 60, 80, 6)
    console.log('[海报] 顶部装饰线完成')
    
    // 主标题
    canvas.setFillStyle('#ffffff')
    canvas.setFontSize(52)
    canvas.setTextAlign('center')
    canvas.fillText('云南旅行', W / 2, 180)
    console.log('[海报] 主标题完成')
    
    // 副标题
    canvas.setFillStyle('rgba(255,255,255,0.85)')
    canvas.setFontSize(24)
    canvas.fillText('6天5晚 · 大理 丽江 雪山', W / 2, 220)
    console.log('[海报] 副标题完成')
    
    // 价格标签背景
    canvas.setFillStyle('#FFD700')
    canvas.beginPath()
    canvas.arc(W / 2, 270, 28, 0, 2 * Math.PI)
    canvas.fill()
    console.log('[海报] 价格标签背景完成')
    
    // 价格文字
    canvas.setFillStyle('#1a1a1a')
    canvas.setFontSize(24)
    canvas.fillText('¥799', W / 2, 278)
    console.log('[海报] 价格文字完成')
    
    // 用户信息卡片
    canvas.setFillStyle('rgba(255,255,255,0.12)')
    roundRect(canvas, 40, 330, W - 80, 90, 16)
    canvas.fill()
    console.log('[海报] 用户信息卡片完成')
    
    // 头像圆形
    canvas.setFillStyle('rgba(255,255,255,0.9)')
    canvas.beginPath()
    canvas.arc(90, 375, 28, 0, 2 * Math.PI)
    canvas.fill()
    console.log('[海报] 头像圆形完成')
    
    // 昵称
    const nickname = userStore.state.nickname || '云南推客'
    canvas.setFillStyle('#ffffff')
    canvas.setFontSize(26)
    canvas.setTextAlign('left')
    canvas.fillText(nickname, 135, 368)
    console.log('[海报] 昵称完成')
    
    // 身份标签
    canvas.setFillStyle('#FFD700')
    canvas.setFontSize(18)
    canvas.fillText('专属推广员', 135, 398)
    console.log('[海报] 身份标签完成')
    
    // 分割线
    canvas.setStrokeStyle('rgba(255,255,255,0.25)')
    canvas.setLineWidth(1)
    canvas.beginPath()
    canvas.moveTo(40, 450)
    canvas.lineTo(W - 40, 450)
    canvas.stroke()
    console.log('[海报] 分割线完成')
    
    // 引导文案
    canvas.setFillStyle('rgba(255,255,255,0.9)')
    canvas.setFontSize(24)
    canvas.setTextAlign('center')
    canvas.fillText('长按识别二维码', W / 2, 490)
    console.log('[海报] 引导文案1完成')
    
    canvas.setFillStyle('rgba(255,255,255,0.6)')
    canvas.setFontSize(18)
    canvas.fillText('下单即永久绑定上下级', W / 2, 520)
    console.log('[海报] 引导文案2完成')
    
    // 二维码区域白色背景
    const qrSize = 160
    const qrX = (W - qrSize) / 2
    const qrY = 545
    canvas.setFillStyle('#ffffff')
    roundRect(canvas, qrX, qrY, qrSize, qrSize, 10)
    canvas.fill()
    console.log('[海报] 二维码区域背景完成，准备调用canvas.draw')
    
    canvas.draw({ reserve: false })
    // type="2d" 模式下 canvas.draw 不触发 success 回调，用 setTimeout 延迟后直接导出
    setTimeout(() => {
      console.log('[海报] 开始导出背景图')
      wx.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        quality: 0.9,
        success: (res) => {
          console.log('[海报] canvasToTempFilePath success:', res.tempFilePath)
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          console.error('[海报] 背景图画布导出失败', err)
          resolve(null)
        }
      })
    }, 100)
    console.log('[海报] canvas.draw 已调用')
  })
}

// 叠加二维码到海报
async function drawPoster(bgPath, qrPath) {
  return new Promise((resolve) => {
    const W = 540
    const H = 765
    const canvas = wx.createCanvasContext('posterCanvas')

    // 画背景
    if (bgPath) {
      canvas.drawImage(bgPath, 0, 0, W, H)
    } else {
      canvas.setFillStyle('#0a6744')
      canvas.fillRect(0, 0, W, H)
    }

    // 叠加二维码
    if (qrPath) {
      canvas.drawImage(qrPath, (W - 130) / 2, 560, 130, 130)
    }

    canvas.draw({ reserve: false })
    // type="2d" 模式下 canvas.draw 不触发 success 回调，用 setTimeout 延迟后直接导出
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        quality: 0.9,
        success: (res) => {
          console.log('[海报] drawPoster 合成成功:', res.tempFilePath)
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          console.error('[海报] 最终画布导出失败', err)
          resolve(bgPath)
        }
      })
    }, 100)
  })
}

// 简化版海报绘制：纯色背景 + QR码
async function drawPosterSimple(qrPath) {
  return new Promise((resolve) => {
    const W = 540
    const H = 765
    console.log('[海报] 创建canvas context')
    const canvas = wx.createCanvasContext('posterCanvas')
    
    // 纯色背景
    canvas.setFillStyle('#0a6744')
    canvas.fillRect(0, 0, W, H)
    console.log('[海报] 背景填充完成')
    
    // 叠加二维码
    if (qrPath) {
      console.log('[海报] 准备绘制QR, path:', qrPath)
      // 先获取图片信息，确保能加载
      wx.getImageInfo({
        src: qrPath,
        success: (imgRes) => {
          console.log('[海报] QR图片加载成功, size:', imgRes.width, imgRes.height)
          canvas.drawImage(imgRes.path, (W - 130) / 2, (H - 130) / 2, 130, 130)
          console.log('[海报] QR码绘制完成')
          canvas.draw({ reserve: false })
          console.log('[海报] canvas.draw已调用(有QR)')
          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvasId: 'posterCanvas',
              quality: 0.9,
              success: (res) => {
                console.log('[海报] 导出成功:', res.tempFilePath)
                resolve(res.tempFilePath)
              },
              fail: (err) => {
                console.error('[海报] 导出失败:', err)
                resolve(null)
              }
            })
          }, 300)
        },
        fail: (err) => {
          console.error('[海报] QR图片加载失败:', err)
          // 退化为只画纯色背景
          canvas.draw({ reserve: false })
          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvasId: 'posterCanvas',
              quality: 0.9,
              success: (res) => resolve(res.tempFilePath),
              fail: (err) => {
                console.error('[海报] 纯色背景导出也失败:', err)
                resolve(null)
              }
            })
          }, 300)
        }
      })
    } else {
      // 没有QR时直接导出
      canvas.draw({ reserve: false })
      console.log('[海报] canvas.draw已调用(无QR)')
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'posterCanvas',
          quality: 0.9,
          success: (res) => resolve(res.tempFilePath),
          fail: (err) => {
            console.error('[海报] 导出失败:', err)
            resolve(null)
          }
        })
      }, 300)
    }
  })
}

// 圆角矩形（兼容旧版 canvas API）
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// 取消海报生成
function cancelGenerate() {
  loading.value = false
  uni.showToast({ title: '已取消', icon: 'none' })
}

// 保存海报到相册
function savePoster() {
  if (!posterUrl.value) {
    uni.showToast({ title: '请先生成海报', icon: 'none' })
    return
  }
  
  uni.saveImageToPhotosAlbum({
    filePath: posterUrl.value,
    success: () => {
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    },
    fail: (err) => {
      if (err.errMsg && err.errMsg.includes('auth deny')) {
        uni.showModal({
          title: '需要相册授权',
          content: '请在「设置」中开启「保存图片到相册」权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) uni.openSetting()
          }
        })
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  })
}
</script>

<style scoped>
page { height: 100%; overflow: hidden; }

.mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.55); z-index: 999;
  display: flex; align-items: center; justify-content: center; padding: 40rpx;
}

.modal-card {
  width: 100%; max-height: 94vh; background: #fff;
  border-radius: 24rpx; overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 24rpx 80rpx rgba(0,0,0,0.35);
}

.modal-header-bar {
  background: #f5f5f5; padding: 48rpx; display: flex; justify-content: center;
}
.modal-header-green {
  background: linear-gradient(135deg, #0a6744, #1a9e6e);
  padding: 32rpx 24rpx; display: flex; justify-content: space-between; align-items: center;
}
.header-info { display: flex; flex-direction: column; gap: 4rpx; }
.header-title { font-size: 34rpx; font-weight: bold; color: #fff; }
.header-sub { font-size: 22rpx; color: rgba(255,255,255,0.7); }
.close-btn {
  position: fixed; top: 20rpx; left: 20rpx; z-index: 9999;
  width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.45); border-radius: 50%; color: #fff; font-size: 30rpx;
  /* 避开小程序原生右上角按钮 */
}

.modal-body { flex: 1; overflow-y: auto; padding: 24rpx; }
.modal-body-center { 
  display: flex; flex-direction: column; align-items: center; 
  padding: 60rpx 40rpx; text-align: center; gap: 20rpx; 
}

.tip-icon-large { font-size: 96rpx; }
.tip-title { font-size: 36rpx; font-weight: bold; color: #333; }
.tip-text { font-size: 26rpx; color: #666; line-height: 1.7; max-width: 500rpx; }

.btn-primary {
  background: linear-gradient(135deg, #0a6744, #1a9e6e);
  color: #fff; font-size: 30rpx; font-weight: bold; 
  padding: 24rpx 60rpx; border-radius: 50rpx; border: none; margin-top: 16rpx;
}
.btn-primary::after { border: none; }

.user-bar {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx; background: #f8f9fa; border-radius: 16rpx; margin-bottom: 20rpx;
}
.user-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; background: #e0e0e0; }
.user-info { display: flex; flex-direction: column; gap: 6rpx; }
.user-name { font-size: 28rpx; font-weight: bold; color: #333; }
.user-badge .badge-text { font-size: 20rpx; color: #0a6744; background: #e8f5f0; padding: 4rpx 12rpx; border-radius: 20rpx; }

.poster-card { margin-bottom: 20rpx; }

/* 海报已生成时显示缩略图 */
.poster-preview {
  position: relative; width: 100%; border-radius: 16rpx; overflow: hidden; margin-bottom: 16rpx;
}
.poster-thumb { width: 100%; height: auto; display: block; }
.poster-hint { 
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,0.45); color: #fff; font-size: 22rpx;
  text-align: center; padding: 8rpx 0;
}

/* 海报未生成时只显示小按钮 */
.poster-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 24rpx 0 16rpx; margin-bottom: 16rpx;
}
.gen-btn {
  display: flex; align-items: center; gap: 10rpx;
  background: linear-gradient(135deg, #0a6744, #1a9e6e);
  color: #fff; font-size: 28rpx; font-weight: bold;
  padding: 20rpx 48rpx; border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(10,103,68,0.35);
}
.gen-btn-icon { font-size: 32rpx; }
.gen-btn-text {}
.gen-tip { font-size: 22rpx; color: #999; margin-top: 10rpx; }

.poster-actions { display: flex; gap: 12rpx; }
.action-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 16rpx 8rpx; border-radius: 12rpx; gap: 4rpx;
}
.action-btn.primary { background: linear-gradient(135deg, #0a6744, #1a9e6e); color: #fff; }
.action-btn.secondary { background: #f0f0f0; color: #333; }
.action-btn.success { background: linear-gradient(135deg, #27c585, #0a6744); color: #fff; }
.action-icon { font-size: 32rpx; }
.action-text { font-size: 22rpx; font-weight: bold; }

.share-text-section { margin-bottom: 20rpx; }
.section-label { font-size: 22rpx; color: #999; margin-bottom: 10rpx; }
.share-text-card {
  position: relative; background: #f8f9fa; border-radius: 12rpx; padding: 20rpx;
}
.share-text-content { font-size: 23rpx; color: #333; line-height: 1.7; white-space: pre-line; }
.copy-indicator {
  position: absolute; top: 12rpx; right: 12rpx;
  font-size: 20rpx; color: #0a6744; background: #e8f5f0;
  padding: 4rpx 14rpx; border-radius: 8rpx;
}

.tips-section { background: #fff8f0; border-radius: 14rpx; padding: 20rpx; }
.tips-title { font-size: 26rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.tips-grid { display: flex; flex-direction: column; gap: 14rpx; }
.tip-item { display: flex; align-items: flex-start; gap: 14rpx; }
.tip-num {
  width: 36rpx; height: 36rpx; background: #0a6744; color: #fff;
  border-radius: 50%; font-size: 20rpx; font-weight: bold;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.tip-content { display: flex; flex-direction: column; gap: 2rpx; }
.tip-label { font-size: 24rpx; font-weight: bold; color: #333; }
.tip-desc { font-size: 21rpx; color: #888; }

.preview-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.92); z-index: 9999;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.preview-toolbar {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; justify-content: flex-end; padding: 24rpx;
  z-index: 1;
}
.toolbar-close {
  color: rgba(255,255,255,0.7); font-size: 26rpx;
  background: rgba(255,255,255,0.15); padding: 10rpx 24rpx; border-radius: 30rpx;
}
.preview-img { width: 90%; max-height: 80vh; border-radius: 16rpx; }
.preview-hint { color: rgba(255,255,255,0.45); font-size: 24rpx; margin-top: 20rpx; }

.loading-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.loading-box {
  background: #fff; border-radius: 20rpx; padding: 48rpx 64rpx;
  display: flex; flex-direction: column; align-items: center; gap: 20rpx;
}
.spinner {
  width: 56rpx; height: 56rpx; border: 4rpx solid #e8e8e8;
  border-top-color: #0a6744; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-label { font-size: 26rpx; color: #333; }
.loading-cancel {
  font-size: 24rpx; color: #999; padding: 8rpx 24rpx;
  border: 1rpx solid #ddd; border-radius: 30rpx;
}</style>

<!-- 隐藏的 canvas 供海报绘制使用 -->
<!-- 注意：WeChat miniprogram 的 canvas-id 不能用 id 选择器，只能用 canvas-id -->
<canvas canvas-id="posterCanvas" 
  style="position:fixed;left:-9999px;top:-9999px;width:540px;height:765px;" />
