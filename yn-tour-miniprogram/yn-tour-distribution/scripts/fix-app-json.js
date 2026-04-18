// scripts/fix-app-json.js
// 构建后自动添加 lazyCodeLoading 到微信小程序的 app.json
const fs = require('fs')
const path = require('path')

const appJsonPath = path.join(__dirname, '..', 'dist', 'build', 'mp-weixin', 'app.json')

if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
  if (!appJson.lazyCodeLoading) {
    appJson.lazyCodeLoading = 'requiredComponents'
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2))
    console.log('[fix-app-json] Added lazyCodeLoading to app.json')
  }
} else {
  console.log('[fix-app-json] app.json not found at', appJsonPath)
}
