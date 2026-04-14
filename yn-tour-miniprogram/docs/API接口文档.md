# 云南旅游分销小程序 - API接口文档

> 更新时间：2026-03-26
> 基础URL: `http://localhost:3000`

---

## 通用响应格式

```json
{
  "code": 200,
  "message": "成功",
  "data": {}
}
```

- `code`: 200表示成功，其他表示错误
- `message`: 响应信息
- `data`: 响应数据

---

## 一、用户相关接口 (`/api/user`)

### 1.1 用户登录/注册
```
POST /api/user/login
```

**请求参数：**
```json
{
  "openid": "用户微信openid",
  "nickname": "用户昵称",
  "avatar": "用户头像URL",
  "parentId": "上级用户ID（可选）",
  "referrerId": "推荐人ID（可选）"
}
```

### 1.2 获取用户信息
```
GET /api/user/info?openid=xxx&userId=xxx
```

**查询参数：**
- `openid`: 微信openid（与userId二选一）
- `userId`: 用户ID（与openid二选一）

### 1.3 成为分销商
```
POST /api/user/become-distributor
```

**请求参数：**
```json
{
  "userId": "用户ID"
}
```

### 1.4 获取用户收益统计（279机制）
```
GET /api/user/earnings?userId=xxx
```

### 1.5 计算可提现金额
```
GET /api/user/calculate-withdraw?userId=xxx
```

### 1.6 获取收益明细
```
GET /api/user/commission-list?userId=xxx&page=1&limit=20
```

### 1.7 获取团队排行榜
```
GET /api/user/team-ranking?limit=10
```

### 1.8 每日签到
```
POST /api/user/sign-in
```

**请求参数：**
```json
{
  "userId": "用户ID"
}
```

### 1.9 记录访问（有效访问奖）
```
POST /api/user/record-visit
```

**请求参数：**
```json
{
  "userId": "用户ID（可选）",
  "visitorId": "访客ID",
  "targetType": "访问目标类型（product/page/home）",
  "targetId": "目标ID（可选）",
  "referrerId": "推荐人ID（可选）",
  "ip": "IP地址",
  "userAgent": "User-Agent"
}
```

### 1.10 获取我的团队信息
```
GET /api/user/my-team?userId=xxx
```

---

## 二、订单相关接口 (`/api/order`)

### 2.1 创建订单
```
POST /api/order/create
```

**请求参数：**
```json
{
  "userId": "用户ID",
  "productId": "商品ID",
  "quantity": 1,
  "travelers": [
    { "name": "姓名", "phone": "电话", "idCard": "身份证号" }
  ],
  "travelDate": "2026-04-01",
  "referrerId": "推荐人ID（可选）"
}
```

### 2.2 创建支付订单
```
POST /api/order/create-payment
```

**请求参数：**
```json
{
  "orderId": "订单ID",
  "paymentMethod": "wechat/alipay"
}
```

### 2.3 模拟支付成功（测试用）
```
POST /api/order/mock-pay
```

**请求参数：**
```json
{
  "orderId": "订单ID",
  "paymentMethod": "wechat/alipay"
}
```

### 2.4 微信支付回调
```
POST /api/order/wechat-callback
```

### 2.5 支付宝支付回调
```
POST /api/order/alipay-callback
```

### 2.6 查询支付状态
```
GET /api/order/pay-status?orderId=xxx
```

### 2.7 获取订单列表
```
GET /api/order/list?userId=xxx&status=all&page=1&limit=20
```

### 2.8 获取订单详情
```
GET /api/order/detail?orderId=xxx
```

### 2.9 取消订单
```
POST /api/order/cancel
```

**请求参数：**
```json
{
  "orderId": "订单ID"
}
```

---

## 三、商品相关接口 (`/api/product`)

### 3.1 获取商品列表
```
GET /api/product/list?page=1&limit=20&status=1
```

### 3.2 获取商品详情
```
GET /api/product/detail?productId=xxx
```

### 3.3 获取首页推荐商品
```
GET /api/product/recommend?limit=5
```

---

## 四、提现相关接口 (`/api/withdraw`)

### 4.1 用户申请提现
```
POST /api/withdraw/apply
```

**请求参数：**
```json
{
  "userId": "用户ID",
  "withdrawMethod": "wechat/alipay/bank",
  "accountInfo": {
    "openid": "微信openid",
    "alipayAccount": "支付宝账号",
    "alipayName": "支付宝姓名",
    "bankName": "银行名称",
    "bankAccount": "银行账号",
    "bankAccountName": "银行账户名"
  },
  "amount": 100
}
```

### 4.2 获取用户提现记录
```
GET /api/withdraw/list?userId=xxx&page=1&limit=20&status=all
```

### 4.3 获取提现详情
```
GET /api/withdraw/detail?withdrawId=xxx
```

### 4.4 管理后台 - 审核提现
```
POST /api/withdraw/approve
```

**请求参数：**
```json
{
  "withdrawId": "提现记录ID",
  "approved": true/false,
  "rejectReason": "拒绝原因（可选）"
}
```

### 4.5 管理后台 - 处理提现
```
POST /api/withdraw/process
```

**请求参数：**
```json
{
  "withdrawId": "提现记录ID"
}
```

### 4.6 管理后台 - 获取所有提现记录
```
GET /api/withdraw/admin-list?page=1&limit=20&status=all
```

---

## 五、管理后台接口 (`/api/admin`)

### 5.1 获取数据看板
```
GET /api/admin/dashboard
```

### 5.2 获取用户列表
```
GET /api/admin/users?page=1&limit=20&keyword=xxx
```

### 5.3 获取订单列表
```
GET /api/admin/orders?page=1&limit=20&status=all&keyword=xxx
```

### 5.4 获取营收统计
```
GET /api/admin/revenue-stats?startDate=2026-03-01&endDate=2026-03-31
```

### 5.5 更新每日统计
```
POST /api/admin/update-daily-stats
```

**请求参数：**
```json
{
  "date": "2026-03-26（可选，默认为今天）"
}
```

---

## 六、279分销机制说明

### 6.1 直推分润规则
- 第1单：30%（239.7元）
- 第2单：70%（559.3元）
- 第3单：30%
- 第4单：70%
- 以此类推...

### 6.2 成团奖
- 条件：团队满7单（自己购买 + 总直推 ≥ 7）
- 奖金：800元/团

### 6.3 分红
- 条件：总直推 ≥ 2单，或成团数 ≥ 1团
- 奖金池：平台当月总营业额 × 2%
- 个人分红 = 奖金池 × (个人团队单量 / 平台合格总单量)

### 6.4 有效访问奖
- 奖励：0.5元/次
- 每日上限：20元

### 6.5 提现规则
- 最低提现：100元
- 手续费：1%（最低1元）

