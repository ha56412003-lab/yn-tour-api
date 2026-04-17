const API_BASE = 'http://localhost:3000/api';

// 当前状态
let currentPage = 'dashboard';
let currentWithdrawId = null;
let usersPage = 1;
let ordersPage = 1;
let withdrawsPage = 1;

// 用户搜索关键字
let userSearchKeyword = '';
let orderStatusFilter = 'all';
let withdrawStatusFilter = 'all';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  updateTime();
  setInterval(updateTime, 1000);
  
  // 设置默认日期
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  document.getElementById('start-date').value = formatDate(thirtyDaysAgo);
  document.getElementById('end-date').value = formatDate(today);
  
  // 导航点击事件
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      switchPage(page);
    });
  });
  
  // 审核结果变化事件
  document.getElementById('withdraw-review-result').addEventListener('change', (e) => {
    const rejectReasonGroup = document.getElementById('withdraw-reject-reason-group');
    if (e.target.value === 'reject') {
      rejectReasonGroup.classList.add('show');
    } else {
      rejectReasonGroup.classList.remove('show');
    }
  });
});

// 更新时间
function updateTime() {
  const now = new Date();
  document.getElementById('current-time').textContent = now.toLocaleString('zh-CN');
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化日期时间
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
}

// 格式化金额
function formatMoney(amount) {
  if (amount === undefined || amount === null) return '¥0';
  return '¥' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 登录
function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // 简单的模拟登录验证
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('adminLoggedIn', 'true');
    showAdminPage();
  } else {
    alert('用户名或密码错误');
  }
}

// 退出登录
function handleLogout() {
  localStorage.removeItem('adminLoggedIn');
  showLoginPage();
}

// 显示登录页面
function showLoginPage() {
  document.getElementById('login-page').classList.add('active');
  document.getElementById('admin-page').classList.remove('active');
}

// 显示管理页面
function showAdminPage() {
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('admin-page').classList.add('active');
  switchPage('dashboard');
}

// 切换页面
function switchPage(page) {
  currentPage = page;
  
  // 更新导航
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
  
  // 更新页面标题
  const titles = {
    dashboard: '数据看板',
    users: '用户管理',
    orders: '订单管理',
    revenue: '营收统计',
    withdraw: '提现审核',
    import: '导入审核',
    products: '产品管理',
    itinerary: '行程管理',
    review: '评价管理',
    'home-decorate': '首页装修'
  };
  document.getElementById('page-title').textContent = titles[page] || page;
  
  // 显示对应内容页面
  document.querySelectorAll('.content-page').forEach(p => {
    p.classList.remove('active');
  });
  document.getElementById(`${page}-page`).classList.add('active');
  
  // 加载页面数据
  if (page === 'dashboard') loadDashboard();
  if (page === 'users') loadUsers();
  if (page === 'orders') loadOrders();
  if (page === 'revenue') loadRevenueStats();
  if (page === 'withdraw') loadWithdraws();
  if (page === 'import') loadImports();
  if (page === 'products') loadProducts();
  if (page === 'itinerary') loadItineraryList();
  if (page === 'review') loadReviewList();
  if (page === 'home-decorate') loadHomeDecorate();
}

// 加载数据看板
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    const result = await res.json();
    
    if (result.code === 200) {
      const data = result.data;
      document.getElementById('total-orders').textContent = data.totalOrders || 0;
      document.getElementById('total-users').textContent = data.totalUsers || 0;
      document.getElementById('total-revenue').textContent = formatMoney(data.totalRevenue);
      document.getElementById('total-withdraw').textContent = formatMoney(data.totalWithdraw);
      document.getElementById('pending-withdraw-count').textContent = data.pendingWithdrawCount || 0;
      document.getElementById('pending-order-count').textContent = data.pendingOrderCount || 0;
    }
  } catch (err) {
    console.error('加载看板数据失败:', err);
    // 使用模拟数据
    document.getElementById('total-orders').textContent = '128';
    document.getElementById('total-users').textContent = '256';
    document.getElementById('total-revenue').textContent = '¥102,272.00';
    document.getElementById('total-withdraw').textContent = '¥25,600.00';
    document.getElementById('pending-withdraw-count').textContent = '5';
    document.getElementById('pending-order-count').textContent = '12';
  }
}

// 加载用户列表
async function loadUsers() {
  try {
    const params = new URLSearchParams({
      page: usersPage,
      limit: 10,
      keyword: userSearchKeyword
    });
    
    const res = await fetch(`${API_BASE}/admin/users?${params}`);
    const result = await res.json();
    
    if (result.code === 200) {
      const { list, pagination } = result.data;
      renderUsersTable(list);
      renderPagination('users-pagination', pagination, (page) => {
        usersPage = page;
        loadUsers();
      });
    }
  } catch (err) {
    console.error('加载用户列表失败:', err);
    renderMockUsers();
  }
}

// 渲染用户表格
function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user._id?.substring(0, 8) || '-'}</td>
      <td>${user.nickname || '-'}</td>
      <td>
        <span class="status-badge ${user.isDistributor ? 'status-paid' : 'status-pending'}">
          ${user.isDistributor ? '是' : '否'}
        </span>
      </td>
      <td>${user.selfOrderNum || 0}</td>
      <td>${formatMoney(user.totalCommission)}</td>
      <td>${formatDateTime(user.createdAt)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="viewUserDetail('${user._id}')">详情</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 模拟用户数据
function renderMockUsers() {
  const mockUsers = [
    { _id: 'user001', nickname: '张三', isDistributor: true, selfOrderNum: 3, totalCommission: 1599, createdAt: '2026-03-01' },
    { _id: 'user002', nickname: '李四', isDistributor: true, selfOrderNum: 2, totalCommission: 999, createdAt: '2026-03-05' },
    { _id: 'user003', nickname: '王五', isDistributor: false, selfOrderNum: 1, totalCommission: 0, createdAt: '2026-03-10' },
  ];
  renderUsersTable(mockUsers);
}

// 搜索用户
function searchUsers() {
  userSearchKeyword = document.getElementById('user-search').value;
  usersPage = 1;
  loadUsers();
}

// 查看用户详情
async function viewUserDetail(userId) {
  const modal = document.getElementById('user-detail-modal');
  const content = document.getElementById('user-detail-content');
  modal.classList.add('active');
  content.innerHTML = '<div class="loading">加载中...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/admin/user-detail?userId=${userId}`);
    const result = await res.json();
    
    if (result.code === 200) {
      const { user, earnings, teamMembers, teamCount } = result.data;
      content.innerHTML = `
        <div class="user-detail-grid">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-row">
              <span class="label">用户ID:</span>
              <span class="value">${user._id}</span>
            </div>
            <div class="detail-row">
              <span class="label">昵称:</span>
              <span class="value">${user.nickname || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">手机号:</span>
              <span class="value">${user.phone || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">是否分销商:</span>
              <span class="value">${user.isDistributor ? '是' : '否'}</span>
            </div>
            <div class="detail-row">
              <span class="label">注册时间:</span>
              <span class="value">${formatDateTime(user.createdAt)}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>订单统计</h4>
            <div class="detail-row">
              <span class="label">自购单数:</span>
              <span class="value">${user.selfOrderNum || 0}</span>
            </div>
            <div class="detail-row">
              <span class="label">直推单数:</span>
              <span class="value">${user.directPushNum || 0}</span>
            </div>
            <div class="detail-row">
              <span class="label">锁客单数:</span>
              <span class="value">${user.lockedUserOrderNum || 0}</span>
            </div>
            <div class="detail-row">
              <span class="label">团队总单数:</span>
              <span class="value">${user.totalTeamOrders || 0}</span>
            </div>
            <div class="detail-row">
              <span class="label">成团数:</span>
              <span class="value highlight">${user.groupNum || 0}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>收益统计</h4>
            <div class="detail-row">
              <span class="label">总收益:</span>
              <span class="value highlight">${formatMoney(user.totalEarnings || 0)}</span>
            </div>
            <div class="detail-row">
              <span class="label">可提现:</span>
              <span class="value highlight">${formatMoney(user.availableBalance || 0)}</span>
            </div>
            <div class="detail-row">
              <span class="label">冻结金额:</span>
              <span class="value">${formatMoney(user.frozenBalance || 0)}</span>
            </div>
          </div>
          
          <div class="detail-section full-width">
            <h4>团队成员 (${teamCount})</h4>
            ${teamMembers.length > 0 ? `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>昵称</th>
                    <th>手机号</th>
                    <th>自购单</th>
                    <th>直推单</th>
                    <th>成团数</th>
                    <th>注册时间</th>
                  </tr>
                </thead>
                <tbody>
                  ${teamMembers.map(member => `
                    <tr>
                      <td>${member.nickname || '-'}</td>
                      <td>${member.phone || '-'}</td>
                      <td>${member.selfOrderNum || 0}</td>
                      <td>${member.directPushNum || 0}</td>
                      <td>${member.groupNum || 0}</td>
                      <td>${formatDateTime(member.createdAt)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="empty-tip">暂无团队成员</p>'}
          </div>
        </div>
      `;
    } else {
      content.innerHTML = `<div class="error">加载失败: ${result.message}</div>`;
    }
  } catch (err) {
    content.innerHTML = `<div class="error">加载失败: ${err.message}</div>`;
  }
}

function closeUserDetailModal() {
  document.getElementById('user-detail-modal').classList.remove('active');
}

// 加载订单列表
async function loadOrders() {
  try {
    const params = new URLSearchParams({
      page: ordersPage,
      limit: 10,
      status: orderStatusFilter
    });
    
    const res = await fetch(`${API_BASE}/admin/orders?${params}`);
    const result = await res.json();
    
    if (result.code === 200) {
      const { list, pagination } = result.data;
      renderOrdersTable(list);
      renderPagination('orders-pagination', pagination, (page) => {
        ordersPage = page;
        loadOrders();
      });
    }
  } catch (err) {
    console.error('加载订单列表失败:', err);
    renderMockOrders();
  }
}

// 渲染订单表格
function renderOrdersTable(orders) {
  const statusMap = {
    pending: { text: '待支付', class: 'status-pending' },
    paid: { text: '已支付', class: 'status-paid' },
    completed: { text: '已完成', class: 'status-completed' },
    cancelled: { text: '已取消', class: 'status-cancelled' },
    refunded: { text: '已退款', class: 'status-cancelled' }
  };
  
  const tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = orders.map(order => {
    const status = statusMap[order.status] || { text: order.status, class: '' };
    return `
      <tr>
        <td>${order.orderNo || '-'}</td>
        <td>${order.productName || '-'}</td>
        <td>${formatMoney(order.totalAmount)}</td>
        <td><span class="status-badge ${status.class}">${status.text}</span></td>
        <td>${order.travelDate || '-'}</td>
        <td>${formatDateTime(order.createdAt)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary" onclick="viewOrderDetail('${order._id}')">详情</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 模拟订单数据
function renderMockOrders() {
  const mockOrders = [
    { _id: 'order001', orderNo: 'TY202603270001', productName: '云南6天5晚·轻奢游', totalAmount: 799, status: 'paid', travelDate: '2026-04-01', createdAt: '2026-03-27 10:30:00' },
    { _id: 'order002', orderNo: 'TY202603270002', productName: '云南6天5晚·轻奢游', totalAmount: 799, status: 'pending', travelDate: '2026-04-05', createdAt: '2026-03-27 11:20:00' },
    { _id: 'order003', orderNo: 'TY202603260001', productName: '云南6天5晚·轻奢游', totalAmount: 799, status: 'completed', travelDate: '2026-03-20', createdAt: '2026-03-20 09:15:00' },
  ];
  renderOrdersTable(mockOrders);
}

// 过滤订单
function filterOrders() {
  orderStatusFilter = document.getElementById('order-status-filter').value;
  ordersPage = 1;
  loadOrders();
}

// 导出待发货订单（CSV）
async function exportOrders() {
  // 固定导出已支付订单（有收货地址）
  const params = new URLSearchParams({ status: 'paid' })
  window.open(`${API_BASE}/admin/orders/export?${params}`, '_blank')
}

// 导入快递弹窗
function showImportDialog() {
  document.getElementById('import-express-file').value = ''
  document.getElementById('import-express-preview').style.display = 'none'
  document.getElementById('import-express-modal').style.display = 'flex'
}

function closeImportExpressModal() {
  document.getElementById('import-express-modal').style.display = 'none'
}

// 监听文件选择
document.getElementById('import-express-file').addEventListener('change', function(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = function(ev) {
    const text = ev.target.result
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) {
      alert('CSV文件内容为空或格式错误')
      return
    }
    // 解析CSV（简单方式，处理带引号的字段）
    const headerLine = lines[0]
    const headers = parseCSVLine(headerLine)
    // 找到平台单号、物流公司、物流单号三列的索引
    const idxOrderNo = headers.findIndex(h => ['平台单号', '订单号', '订单编号'].includes(h))
    const idxExpressNo = headers.findIndex(h => ['物流单号', '快递单号', '运单号'].includes(h))
    const idxExpressCompany = headers.findIndex(h => ['物流公司', '快递公司'].includes(h))
    if (idxOrderNo < 0 || idxExpressNo < 0) {
      alert('CSV列名不符合要求，请包含「平台单号」和「物流单号」列')
      return
    }
    const orders = []
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      const orderNo = cols[idxOrderNo] || ''
      const expressNo = cols[idxExpressNo] || ''
      const expressCompany = idxExpressCompany >= 0 ? (cols[idxExpressCompany] || '') : ''
      if (orderNo && expressNo) {
        orders.push({ orderNo: orderNo.trim(), expressNo: expressNo.trim(), expressCompany: expressCompany.trim() })
      }
    }
    if (orders.length === 0) {
      alert('未解析到有效的订单数据，请检查CSV格式')
      return
    }
    document.getElementById('import-express-preview').style.display = 'block'
    document.getElementById('import-express-count').textContent = `已解析 ${orders.length} 条快递记录，确认导入后将更新对应订单`
    // 把数据存到文件input的data属性
    document.getElementById('import-express-file')._parsedData = orders
  }
  reader.readAsText(file)
})

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

async function submitImportExpress() {
  const fileInput = document.getElementById('import-express-file')
  const orders = fileInput._parsedData
  if (!orders || orders.length === 0) {
    alert('请先选择CSV文件')
    return
  }
  const btn = document.querySelector('#import-express-modal .btn-primary')
  btn.disabled = true
  btn.textContent = '导入中...'
  try {
    const res = await fetch(`${API_BASE}/admin/orders/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders })
    })
    const data = await res.json()
    if (data.code === 200) {
      alert(`导入完成：成功 ${data.data.success} 条，失败 ${data.data.failed} 条`)
      if (data.data.errors.length > 0) {
        console.warn('导入错误:', data.data.errors)
      }
      closeImportExpressModal()
      loadOrders() // 刷新列表
    } else {
      alert('导入失败：' + data.message)
    }
  } catch (err) {
    alert('导入异常：' + err.message)
  } finally {
    btn.disabled = false
    btn.textContent = '确认导入'
  }
}

// 查看订单详情
async function viewOrderDetail(orderId) {
  const modal = document.getElementById('order-detail-modal');
  const content = document.getElementById('order-detail-content');
  modal.classList.add('active');
  content.innerHTML = '<div class="loading">加载中...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/order/detail?orderId=${orderId}`);
    const result = await res.json();
    
    if (result.code === 200) {
      const order = result.data;
      const deliveryAddress = order.deliveryAddress || {};
      const hasDelivery = deliveryAddress && deliveryAddress.receiverName;
      const canShip = order.status === 'paid' && hasDelivery;
      const isShipped = order.status === 'processing' || order.deliveryStatus === 'shipped';
      
      content.innerHTML = `
        <div class="user-detail-grid">
          <div class="detail-section">
            <h4>订单信息</h4>
            <div class="detail-row">
              <span class="label">订单号:</span>
              <span class="value">${order.orderNo || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">订单状态:</span>
              <span class="value">${getStatusText(order.status)}</span>
            </div>
            <div class="detail-row">
              <span class="label">下单时间:</span>
              <span class="value">${formatDateTime(order.createdAt)}</span>
            </div>
            <div class="detail-row">
              <span class="label">支付时间:</span>
              <span class="value">${formatDateTime(order.paidAt)}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>商品信息</h4>
            <div class="detail-row">
              <span class="label">商品名称:</span>
              <span class="value">${order.productName || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">单价:</span>
              <span class="value">${formatMoney(order.productPrice || 0)}</span>
            </div>
            <div class="detail-row">
              <span class="label">数量:</span>
              <span class="value">${order.quantity || 1}</span>
            </div>
            <div class="detail-row">
              <span class="label">总金额:</span>
              <span class="value highlight">${formatMoney(order.totalAmount || 0)}</span>
            </div>
          </div>
          
          ${hasDelivery ? `
          <div class="detail-section full-width">
            <h4>收货地址</h4>
            <div class="detail-row">
              <span class="label">收货人:</span>
              <span class="value">${deliveryAddress.receiverName || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">手机号:</span>
              <span class="value">${deliveryAddress.receiverPhone || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">详细地址:</span>
              <span class="value">${deliveryAddress.fullAddress || '-'}</span>
            </div>
          </div>
          ` : ''}
          
          ${isShipped ? `
          <div class="detail-section full-width">
            <h4>物流信息</h4>
            <div class="detail-row">
              <span class="label">快递公司:</span>
              <span class="value">${order.expressCompany || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">快递单号:</span>
              <span class="value">${order.expressNo || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="label">发货时间:</span>
              <span class="value">${formatDateTime(order.shippedAt)}</span>
            </div>
          </div>
          ` : ''}
          
          <div class="detail-section full-width">
            <h4>操作</h4>
            ${canShip ? `
              <button class="btn btn-primary" onclick="openShipModal('${orderId}')">📦 立即发货</button>
            ` : isShipped ? `
              <span class="status-badge status-completed">✓ 已发货</span>
            ` : order.status === 'pending' ? `
              <span class="status-badge status-pending">待支付</span>
            ` : order.status === 'completed' ? `
              <span class="status-badge status-completed">已完成</span>
            ` : `
              <span class="status-badge status-processing">处理中</span>
            `}
          </div>
        </div>
      `;
    } else {
      content.innerHTML = `<div class="error">加载失败: ${result.message}</div>`;
    }
  } catch (err) {
    content.innerHTML = `<div class="error">加载失败: ${err.message}</div>`;
  }
}

function closeOrderDetailModal() {
  document.getElementById('order-detail-modal').classList.remove('active');
}

function openShipModal(orderId) {
  const modal = document.getElementById('ship-modal');
  document.getElementById('ship-order-id').value = orderId;
  document.getElementById('ship-no').value = '';
  modal.classList.add('active');
  
  // 加载订单收货地址信息
  fetch(`${API_BASE}/order/detail?orderId=${orderId}`)
    .then(res => res.json())
    .then(result => {
      if (result.code === 200) {
        const addr = result.data.deliveryAddress || {};
        document.getElementById('ship-receiver').value = addr.receiverName || '';
        document.getElementById('ship-phone').value = addr.receiverPhone || '';
        document.getElementById('ship-address').value = addr.fullAddress || '';
      }
    });
}

function closeShipModal() {
  document.getElementById('ship-modal').classList.remove('active');
}

async function submitShip() {
  const orderId = document.getElementById('ship-order-id').value;
  const expressCompany = document.getElementById('ship-company').value;
  const expressNo = document.getElementById('ship-no').value;
  
  if (!expressNo) {
    alert('请输入快递单号');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/order/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, expressCompany, expressNo })
    });
    const result = await res.json();
    
    if (result.code === 200) {
      alert('发货成功！');
      closeShipModal();
      closeOrderDetailModal();
      loadOrders(); // 刷新订单列表
    } else {
      alert('发货失败: ' + result.message);
    }
  } catch (err) {
    alert('发货失败: ' + err.message);
  }
}

function getStatusText(status) {
  const map = {
    'pending': '待支付',
    'paid': '已支付',
    'processing': '处理中',
    'completed': '已完成',
    'cancelled': '已取消',
    'refunded': '已退款'
  };
  return map[status] || status;
}

// 加载营收统计
async function loadRevenueStats() {
  try {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    
    const res = await fetch(`${API_BASE}/admin/revenue-stats?${params}`);
    const result = await res.json();
    
    if (result.code === 200) {
      renderRevenueStats(result.data);
    }
  } catch (err) {
    console.error('加载营收统计失败:', err);
    renderMockRevenueStats();
  }
}

// 渲染营收统计
function renderRevenueStats(data) {
  document.getElementById('revenue-total').textContent = formatMoney(data?.totalRevenue);
  document.getElementById('revenue-orders').textContent = data?.orderCount || 0;
}

// 模拟营收数据
function renderMockRevenueStats() {
  document.getElementById('revenue-total').textContent = '¥102,272.00';
  document.getElementById('revenue-orders').textContent = '128';
}

// 加载提现列表
async function loadWithdraws() {
  try {
    const params = new URLSearchParams({
      page: withdrawsPage,
      limit: 10,
      status: withdrawStatusFilter
    });
    
    const res = await fetch(`${API_BASE}/withdraw/admin-list?${params}`);
    const result = await res.json();
    
    if (result.code === 200) {
      const { list, pagination } = result.data;
      renderWithdrawsTable(list);
      renderPagination('withdraw-pagination', pagination, (page) => {
        withdrawsPage = page;
        loadWithdraws();
      });
    }
  } catch (err) {
    console.error('加载提现列表失败:', err);
    renderMockWithdraws();
  }
}

// 渲染提现表格
function renderWithdrawsTable(withdraws) {
  const statusMap = {
    pending: { text: '待审核', class: 'status-pending' },
    approved: { text: '已通过', class: 'status-approved' },
    rejected: { text: '已拒绝', class: 'status-rejected' },
    processing: { text: '处理中', class: 'status-processing' },
    completed: { text: '已完成', class: 'status-completed' }
  };
  
  const methodMap = {
    wechat: '微信',
    alipay: '支付宝',
    bank: '银行卡'
  };
  
  const tbody = document.getElementById('withdraw-table-body');
  tbody.innerHTML = withdraws.map(withdraw => {
    const status = statusMap[withdraw.status] || { text: withdraw.status, class: '' };
    const method = methodMap[withdraw.withdrawMethod] || withdraw.withdrawMethod;
    return `
      <tr>
        <td>${withdraw._id?.substring(0, 8) || '-'}</td>
        <td>${withdraw.userId?.nickname || withdraw.userId?.substring(0, 8) || '-'}</td>
        <td>${method}</td>
        <td>${formatMoney(withdraw.amount)}</td>
        <td>${formatMoney(withdraw.fee)}</td>
        <td>${formatMoney(withdraw.actualAmount)}</td>
        <td><span class="status-badge ${status.class}">${status.text}</span></td>
        <td>${formatDateTime(withdraw.createdAt)}</td>
        <td>
          <div class="table-actions">
            ${withdraw.status === 'pending' ? `
              <button class="btn btn-sm btn-success" onclick="openWithdrawAuditModal('${withdraw._id}')">审核</button>
            ` : `
              <button class="btn btn-sm btn-secondary" onclick="viewWithdrawDetail('${withdraw._id}')">详情</button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 模拟提现数据
function renderMockWithdraws() {
  const mockWithdraws = [
    { _id: 'wd001', userId: { nickname: '张三' }, withdrawMethod: 'wechat', amount: 500, fee: 5, actualAmount: 495, status: 'pending', createdAt: '2026-03-27 10:30:00' },
    { _id: 'wd002', userId: { nickname: '李四' }, withdrawMethod: 'alipay', amount: 1000, fee: 10, actualAmount: 990, status: 'approved', createdAt: '2026-03-26 15:20:00' },
    { _id: 'wd003', userId: { nickname: '王五' }, withdrawMethod: 'bank', amount: 2000, fee: 20, actualAmount: 1980, status: 'completed', createdAt: '2026-03-25 09:15:00' },
  ];
  renderWithdrawsTable(mockWithdraws);
}

// 过滤提现
function filterWithdraws() {
  withdrawStatusFilter = document.getElementById('withdraw-status-filter').value;
  withdrawsPage = 1;
  loadWithdraws();
}

// 打开提现审核弹窗
function openWithdrawAuditModal(withdrawId) {
  currentWithdrawId = withdrawId;
  document.getElementById('withdraw-review-result').value = 'approve';
  document.getElementById('withdraw-reject-reason').value = '';
  document.getElementById('withdraw-reject-reason-group').classList.remove('show');
  document.getElementById('withdraw-audit-modal').classList.add('active');
}

function closeWithdrawAuditModal() {
  document.getElementById('withdraw-audit-modal').classList.remove('active');
  currentWithdrawId = null;
}

async function submitWithdrawAudit() {
  if (!currentWithdrawId) return;
  const reviewResult = document.getElementById('withdraw-review-result').value;
  const rejectReason = document.getElementById('withdraw-reject-reason').value;
  try {
    const res = await fetch(`${API_BASE}/withdraw/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        withdrawId: currentWithdrawId,
        approved: reviewResult === 'approve',
        rejectReason: reviewResult === 'reject' ? rejectReason : undefined
      })
    });
    const result = await res.json();
    if (result.code === 200) {
      alert('审核成功');
      closeWithdrawAuditModal();
      loadWithdraws();
      loadDashboard();
    } else {
      alert(result.message || '审核失败');
    }
  } catch (err) {
    console.error('审核失败:', err);
    alert('审核失败');
    closeWithdrawAuditModal();
  }
}

// 查看提现详情
function viewWithdrawDetail(withdrawId) {
  alert('提现详情功能开发中...');
}

// 渲染分页
function renderPagination(containerId, pagination, onPageChange) {
  const container = document.getElementById(containerId);
  if (!pagination || pagination.pages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = `
    <button ${pagination.page <= 1 ? 'disabled' : ''} onclick="(${onPageChange})(${pagination.page - 1})">上一页</button>
  `;
  
  for (let i = 1; i <= pagination.pages; i++) {
    html += `
      <button class="${i === pagination.page ? 'active' : ''}" onclick="(${onPageChange})(${i})">${i}</button>
    `;
  }
  
  html += `
    <button ${pagination.page >= pagination.pages ? 'disabled' : ''} onclick="(${onPageChange})(${pagination.page + 1})">下一页</button>
  `;
  
  container.innerHTML = html;
}

// ============ 导入审核相关 ============

let importsPage = 1;
let importStatusFilter = 'all';

async function loadImports() {
  try {
    const params = new URLSearchParams({
      page: importsPage,
      limit: 10,
      status: importStatusFilter
    });
    
    const res = await fetch(`${API_BASE}/import/list?${params}`);
    const result = await res.json();
    
    if (result.code === 200) {
      const { list, pagination } = result.data;
      renderImportsTable(list);
      renderPagination('import-pagination', pagination, (page) => {
        importsPage = page;
        loadImports();
      });
    }
  } catch (err) {
    console.error('加载导入审核列表失败:', err);
  }
}

function renderImportsTable(list) {
  const tbody = document.getElementById('import-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999;padding:40px;">暂无数据</td></tr>';
    return;
  }
  
  tbody.innerHTML = list.map(item => `
    <tr>
      <td>${item._id?.substring(0, 8) || '-'}</td>
      <td>${item.nickname || '-'}</td>
      <td>${item.phone || '-'}</td>
      <td>${item.importSource || '淘宝'}</td>
      <td>${item.importOrderNo || '-'}</td>
      <td>
        <span class="status-badge ${item.status === 'approved' ? 'status-approved' : item.status === 'rejected' ? 'status-rejected' : 'status-pending'}">
          ${item.status === 'pending' ? '待审核' : item.status === 'approved' ? '已通过' : '已拒绝'}
        </span>
      </td>
      <td>${formatDateTime(item.createdAt)}</td>
      <td>
        <div class="table-actions">
          ${item.status === 'pending' ? `
            <button class="btn btn-sm btn-success" onclick="approveImport('${item._id}')">通过</button>
            <button class="btn btn-sm btn-danger" onclick="rejectImport('${item._id}')">拒绝</button>
          ` : `
            <button class="btn btn-sm btn-secondary" onclick="viewImportDetail('${item._id}')">详情</button>
          `}
        </div>
      </td>
    </tr>
  `).join('');
}

function filterImports() {
  importStatusFilter = document.getElementById('import-status-filter').value;
  importsPage = 1;
  loadImports();
}

async function approveImport(id) {
  if (!confirm('确认通过审核？该用户将成为分销商。')) return;
  
  try {
    const res = await fetch(`${API_BASE}/import/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await res.json();
    
    if (result.code === 200) {
      alert('审核通过！');
      loadImports();
    } else {
      alert('操作失败: ' + result.message);
    }
  } catch (err) {
    alert('操作失败: ' + err.message);
  }
}

async function rejectImport(id) {
  openImportRejectModal(id);
}

async function viewImportDetail(id) {
  try {
    // 重新拉取最新数据
    const res = await fetch(`${API_BASE}/import/list?status=all&page=1&limit=200`);
    const result = await res.json();
    
    if (result.code !== 200) {
      alert('加载失败: ' + result.message);
      return;
    }
    
    const item = result.data.list.find(i => i._id === id);
    if (!item) {
      alert('未找到该记录');
      return;
    }
    
    const statusMap = {
      pending: { text: '待审核', class: 'status-pending' },
      approved: { text: '已通过', class: 'status-approved' },
      rejected: { text: '已拒绝', class: 'status-rejected' }
    };
    const status = statusMap[item.status] || { text: item.status, class: '' };
    
    const detailHTML = `
      <div class="detail-section">
        <h4>申请人信息</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <label>用户昵称</label>
            <span>${item.nickname || '-'}</span>
          </div>
          <div class="detail-item">
            <label>手机号</label>
            <span>${item.phone || '-'}</span>
          </div>
          <div class="detail-item">
            <label>申请时间</label>
            <span>${formatDateTime(item.createdAt)}</span>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <h4>导入订单信息</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <label>来源平台</label>
            <span>${item.importSource || '淘宝'}</span>
          </div>
          <div class="detail-item">
            <label>订单号</label>
            <span style="word-break:break-all;">${item.importOrderNo || '-'}</span>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <h4>审核结果</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <label>状态</label>
            <span class="status-badge ${status.class}">${status.text}</span>
          </div>
          <div class="detail-item">
            <label>审核时间</label>
            <span>${item.reviewAt ? formatDateTime(item.reviewAt) : '-'}</span>
          </div>
          <div class="detail-item">
            <label>审核备注</label>
            <span>${item.reviewRemark || '-'}</span>
          </div>
        </div>
      </div>
      ${item.status === 'pending' ? `
      <div class="detail-actions">
        <button class="btn btn-success" onclick="closeImportDetailModal(); approveImport('${item._id}')">通过审核</button>
        <button class="btn btn-danger" onclick="closeImportDetailModal(); openImportRejectModal('${item._id}')">拒绝</button>
      </div>
      ` : ''}
    `;
    
    document.getElementById('import-detail-content').innerHTML = detailHTML;
    document.getElementById('import-detail-modal').style.display = 'block';
  } catch (err) {
    console.error('加载导入详情失败:', err);
    alert('加载详情失败');
  }
}

function closeImportDetailModal() {
  document.getElementById('import-detail-modal').style.display = 'none';
}

function openImportRejectModal(id) {
  document.getElementById('import-reject-id').value = id;
  document.getElementById('import-reject-reason').value = '';
  document.getElementById('import-reject-modal').style.display = 'block';
}

function closeImportRejectModal() {
  document.getElementById('import-reject-modal').style.display = 'none';
}

async function submitImportReject() {
  const id = document.getElementById('import-reject-id').value;
  const reason = document.getElementById('import-reject-reason').value.trim();
  
  if (!reason) {
    alert('请输入拒绝原因');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/import/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reviewRemark: reason })
    });
    const result = await res.json();
    
    if (result.code === 200) {
      alert('已拒绝');
      closeImportRejectModal();
      loadImports();
    } else {
      alert('操作失败: ' + result.message);
    }
  } catch (err) {
    alert('操作失败: ' + err.message);
  }
}

// ============ 产品管理相关 ============

let currentEditingProduct = null;
let itineraryDays = [];
let highlightItems = [];
let noticeItems = [];
let mainImageUrls = [];  // 产品主图数组
let detailImageUrls = [];  // 产品详情图数组

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/product/all`);
    const result = await res.json();
    
    if (result.code === 200) {
      renderProductsTable(result.data);
    } else {
      alert('加载产品列表失败: ' + result.message);
    }
  } catch (err) {
    console.error('加载产品列表失败:', err);
    renderMockProducts();
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('products-table-body');
  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999;padding:40px;">暂无产品</td></tr>';
    return;
  }
  
  tbody.innerHTML = products.map(product => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          ${product.images && product.images[0] ? `<img src="${product.images[0]}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">` : '<div style="width:50px;height:50px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center;">无图</div>'}
          <div>
            <div style="font-weight:500;">${product.name}</div>
            <div style="font-size:12px;color:#999;">${product.subtitle || '-'}</div>
          </div>
        </div>
      </td>
      <td>
        <span style="color:#ff6b00;font-weight:600;">¥${product.price}</span>
        ${product.isPromotion && product.promotionPrice ? `<br><span style="color:#999;text-decoration:line-through;font-size:12px;">¥${product.originalPrice || product.price}</span>` : ''}
      </td>
      <td><span style="color:#999;">¥${product.originalPrice || '-'}</span></td>
      <td>
        ${product.distributionEnabled ? 
          `<span class="status-badge status-paid">参与279</span><br><span style="font-size:11px;color:#666;">奇${((product.commission?.level1 || 0) * 100).toFixed(0)}% 偶${((product.commission?.level2 || 0) * 100).toFixed(0)}%</span>` : 
          `<span class="status-badge" style="background:#e0e0e0;color:#666;">正价</span>`
        }
      </td>
      <td>
        ${product.isPromotion ? 
          `<span class="status-badge status-paid">促销 ¥${product.promotionPrice}</span>` : 
          `<span class="status-badge" style="background:#e0e0e0;color:#666;">未促销</span>`
        }
      </td>
      <td>
        <span class="status-badge ${product.status === 1 ? 'status-paid' : 'status-cancelled'}">
          ${product.status === 1 ? '上架' : '下架'}
        </span>
      </td>
      <td>${product.sort || 0}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-primary" onclick="editProduct('${product._id}')">编辑</button>
          <button class="btn btn-sm ${product.status === 1 ? 'btn-warning' : 'btn-success'}" onclick="toggleProductStatus('${product._id}')">
            ${product.status === 1 ? '下架' : '上架'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderMockProducts() {
  const mockProducts = [
    { _id: 'p001', name: '云南6天5晚·深度纯玩游', subtitle: '昆明大理丽江·洱海·玉龙雪山', price: 799, originalPrice: 2999, status: 1, sort: 1, commission: { level1: 0.3, level2: 0.7 }, isPromotion: false }
  ];
  renderProductsTable(mockProducts);
}

// ========== 产品关联行程 ==========
async function loadItineraryOptions() {
  try {
    const res = await fetch(`${API_BASE}/itinerary/all`);
    const result = await res.json();
    const select = document.getElementById('product-itinerary-select');
    select.innerHTML = '<option value="">-- 不关联行程库 --</option>';
    if (result.code === 200 && result.data && result.data.length > 0) {
      result.data.forEach(it => {
        const opt = document.createElement('option');
        opt.value = it._id;
        opt.textContent = `${it.name}（${it.duration || '未设天数'}）`;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('加载行程列表失败', err);
  }
}

async function loadItineraryToProduct() {
  const itineraryId = document.getElementById('product-itinerary-select').value;
  if (!itineraryId) {
    alert('请先选择要关联的行程');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/itinerary/detail?itineraryId=${itineraryId}`);
    const result = await res.json();
    if (result.code === 200) {
      const it = result.data;
      // 填充基础字段
      if (it.duration) document.getElementById('product-duration').value = it.duration;
      if (it.destinations && it.destinations.length > 0) {
        document.getElementById('product-destinations').value = it.destinations.join('、');
      }
      // 填充行程编辑器
      itineraryDays = (it.days && it.days.length > 0)
        ? it.days.map(d => ({ day: d.day || 1, title: d.title || '', description: d.description || '', meals: d.meals || '', tags: d.tags || '' }))
        : DEFAULT_ITINERARY.map(d => ({ ...d }));
      highlightItems = (it.highlights && it.highlights.length > 0)
        ? it.highlights.map(h => ({ icon: h.icon || '', text: h.text || '' }))
        : DEFAULT_HIGHLIGHTS.map(h => ({ ...h }));
      noticeItems = (it.notices && it.notices.length > 0) ? [...it.notices] : [...DEFAULT_NOTICES];
      document.getElementById('product-fee-include').value = (it.feeInclude || []).join('\n');
      document.getElementById('product-fee-exclude').value = (it.feeExclude || []).join('\n');
      renderItineraryEditor();
      renderHighlightsEditor();
      renderNoticesEditor();
      alert('行程内容已加载，可手动调整');
    } else {
      alert('加载行程详情失败');
    }
  } catch (err) {
    alert('加载行程详情失败');
  }
}

// 分销开关联动
function toggleDistributionFields() {
  const enabled = document.getElementById('product-distribution-enabled').value === 'true';
  document.getElementById('distribution-fields').style.display = enabled ? 'block' : 'none';
}

function openProductModal(productId) {
  currentEditingProduct = null;
  mainImageUrls = [];
  detailImageUrls = [];
  
  // 重置表单
  document.getElementById('product-id').value = '';
  document.getElementById('product-name').value = '';
  document.getElementById('product-subtitle').value = '';
  document.getElementById('product-price').value = '';
  document.getElementById('product-original-price').value = '';
  document.getElementById('product-duration').value = '';
  document.getElementById('product-destinations').value = '';
  document.getElementById('product-description').value = '';
  document.getElementById('product-sort').value = '0';
  document.getElementById('product-commission-level1').value = '0.3';
  document.getElementById('product-commission-level2').value = '0.7';
  document.getElementById('product-distribution-enabled').value = 'false';
  toggleDistributionFields();
  document.getElementById('product-is-promotion').value = 'false';
  document.getElementById('product-promotion-price').value = '';
  document.getElementById('product-promotion-end').value = '';
  document.getElementById('product-main-images').value = '';
  document.getElementById('product-detail-images').value = '';
  
  // 重置图片预览（新的多图区域）
  renderMainImages();
  renderDetailImages();
  
  if (productId) {
    document.getElementById('product-modal-title').textContent = '编辑产品';
    loadProductDetail(productId);
  } else {
    document.getElementById('product-modal-title').textContent = '新增产品';
  }
  
  document.getElementById('product-modal').classList.add('active');
  loadItineraryOptions(); // 加载行程下拉选项
  
  // 初始化编辑器
  itineraryDays = DEFAULT_ITINERARY.map(d => ({ ...d }));
  highlightItems = DEFAULT_HIGHLIGHTS.map(h => ({ ...h }));
  noticeItems = [...DEFAULT_NOTICES];
  document.getElementById('product-fee-include').value = '';
  document.getElementById('product-fee-exclude').value = '';
  renderItineraryEditor();
  renderHighlightsEditor();
  renderNoticesEditor();
}

async function loadProductDetail(productId) {
  try {
    const res = await fetch(`${API_BASE}/product/detail?productId=${productId}`);
    const result = await res.json();
    
    if (result.code === 200) {
      const p = result.data;
      currentEditingProduct = p;
      
      document.getElementById('product-id').value = p._id;
      document.getElementById('product-name').value = p.name;
      document.getElementById('product-subtitle').value = p.subtitle || '';
      document.getElementById('product-price').value = p.price;
      document.getElementById('product-original-price').value = p.originalPrice || '';
      document.getElementById('product-duration').value = p.duration || '';
      document.getElementById('product-destinations').value = (p.destinations || []).join('、');
      document.getElementById('product-description').value = p.description || '';
      document.getElementById('product-sort').value = p.sort || 0;
      document.getElementById('product-commission-level1').value = p.commission?.level1 ?? 0.3;
      document.getElementById('product-commission-level2').value = p.commission?.level2 ?? 0.7;
      document.getElementById('product-distribution-enabled').value = String(p.distributionEnabled === true);
      toggleDistributionFields();
      document.getElementById('product-is-promotion').value = String(!!p.isPromotion);
      document.getElementById('product-promotion-price').value = p.promotionPrice || '';
      document.getElementById('product-promotion-end').value = p.promotionEnd ? p.promotionEnd.split('T')[0] : '';
      
      // 回显关联行程
      if (p.itineraryId) {
        document.getElementById('product-itinerary-select').value = p.itineraryId;
      }
      
      // 主图
      mainImageUrls = p.mainImages || [];
      renderMainImages();
      // 详情图
      detailImageUrls = p.detailImages || [];
      renderDetailImages();

      // 行程编辑器
      itineraryDays = (p.itinerary && p.itinerary.length > 0)
        ? p.itinerary.map(d => ({ day: d.day || 1, title: d.title || '', description: d.description || '', meals: d.meals || '', tags: d.tags || '' }))
        : DEFAULT_ITINERARY.map(d => ({ ...d }));
      // 亮点编辑器
      highlightItems = (p.highlights && p.highlights.length > 0)
        ? p.highlights.map(h => ({ icon: h.icon || '', text: h.text || '' }))
        : DEFAULT_HIGHLIGHTS.map(h => ({ ...h }));
      // 须知编辑器
      noticeItems = (p.notices && p.notices.length > 0) ? [...p.notices] : [...DEFAULT_NOTICES];
      // 费用说明
      document.getElementById('product-fee-include').value = (p.feeInclude || []).join('\n');
      document.getElementById('product-fee-exclude').value = (p.feeExclude || []).join('\n');
      renderItineraryEditor();
      renderHighlightsEditor();
      renderNoticesEditor();
    }
  } catch (err) {
    alert('加载产品详情失败');
  }
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
  currentEditingProduct = null;
}

function editProduct(productId) {
  openProductModal(productId);
}

async function toggleProductStatus(productId) {
  if (!confirm('确认切换产品上下架状态？')) return;
  
  try {
    const res = await fetch(`${API_BASE}/product/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    const result = await res.json();
    
    if (result.code === 200) {
      alert(result.message);
      loadProducts();
    } else {
      alert('操作失败: ' + result.message);
    }
  } catch (err) {
    alert('操作失败: ' + err.message);
  }
}

// === 主图上传 ===
function triggerMainImageUpload() {
  document.getElementById('main-image-input').click();
}

async function handleMainImageUpload(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  if (mainImageUrls.length + files.length > 5) {
    alert('主图最多上传5张');
    event.target.value = '';
    return;
  }
  for (const file of files) {
    const url = await uploadImage(file);
    if (url) mainImageUrls.push(url);
  }
  renderMainImages();
  event.target.value = '';
}

function removeMainImage(index) {
  mainImageUrls.splice(index, 1);
  renderMainImages();
}

function renderMainImages() {
  const area = document.getElementById('main-images-area');
  const placeholder = document.getElementById('main-image-placeholder');
  // 清除旧图片项（保留placeholder）
  area.querySelectorAll('.image-item').forEach(el => el.remove());
  // 渲染已有图片
  mainImageUrls.forEach((url, i) => {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.innerHTML = `<img src="${url}" alt=""><button type="button" class="remove-btn" onclick="removeMainImage(${i})">×</button><span class="img-order">${i+1}</span>`;
    area.insertBefore(item, placeholder);
  });
  placeholder.style.display = mainImageUrls.length >= 5 ? 'none' : 'flex';
  document.getElementById('product-main-images').value = JSON.stringify(mainImageUrls);
}

// === 详情图上传 ===
function triggerDetailImageUpload() {
  document.getElementById('detail-image-input').click();
}

async function handleDetailImageUpload(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  for (const file of files) {
    const url = await uploadImage(file);
    if (url) detailImageUrls.push(url);
  }
  renderDetailImages();
  event.target.value = '';
}

function removeDetailImage(index) {
  detailImageUrls.splice(index, 1);
  renderDetailImages();
}

function renderDetailImages() {
  const area = document.getElementById('detail-images-area');
  const placeholder = document.getElementById('detail-image-placeholder');
  area.querySelectorAll('.image-item').forEach(el => el.remove());
  detailImageUrls.forEach((url, i) => {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.innerHTML = `<img src="${url}" alt=""><button type="button" class="remove-btn" onclick="removeDetailImage(${i})">×</button>`;
    area.insertBefore(item, placeholder);
  });
  placeholder.style.display = 'flex';
  document.getElementById('product-detail-images').value = JSON.stringify(detailImageUrls);
}

// 通用上传图片函数
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  try {
    const res = await fetch(`${API_BASE}/product/upload-image`, { method: 'POST', body: formData });
    const result = await res.json();
    if (result.code === 200) return result.data.url;
    alert('上传失败: ' + result.message);
  } catch (err) {
    alert('上传失败: ' + err.message);
  }
  return null;
}

async function submitProduct() {
  const productId = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  
  if (!name) {
    alert('请输入产品名称');
    return;
  }
  if (isNaN(price) || price <= 0) {
    alert('请输入正确的价格');
    return;
  }
  
  const level1 = parseFloat(document.getElementById('product-commission-level1').value);
  const level2 = parseFloat(document.getElementById('product-commission-level2').value);
  
  const distributionEnabled = document.getElementById('product-distribution-enabled').value === 'true';

  if (distributionEnabled) {
    if (isNaN(level1) || level1 < 0 || level1 > 1) {
      alert('请输入正确的直推奇数单佣金比例（0-1之间）');
      return;
    }
    if (isNaN(level2) || level2 < 0 || level2 > 1) {
      alert('请输入正确的直推偶数单佣金比例（0-1之间）');
      return;
    }
  }
  
  const destinations = document.getElementById('product-destinations').value
    .split(/[,，、]/)
    .map(d => d.trim())
    .filter(d => d);
  
  const data = {
    name,
    subtitle: document.getElementById('product-subtitle').value.trim(),
    price,
    originalPrice: parseFloat(document.getElementById('product-original-price').value) || 0,
    duration: document.getElementById('product-duration').value.trim(),
    destinations,
    description: document.getElementById('product-description').value.trim(),
    sort: parseInt(document.getElementById('product-sort').value) || 0,
    distributionEnabled,
    commission: distributionEnabled ? { level1, level2 } : null,
    isPromotion: document.getElementById('product-is-promotion').value === 'true',
    promotionPrice: parseFloat(document.getElementById('product-promotion-price').value) || 0,
    promotionEnd: document.getElementById('product-promotion-end').value || null,
    mainImages: mainImageUrls,
    detailImages: detailImageUrls,
    // 新增字段
    itinerary: itineraryDays.filter(d => d.title),
    highlights: highlightItems.filter(h => h.text),
    feeInclude: document.getElementById('product-fee-include').value.split('\n').map(s => s.trim()).filter(s => s),
    feeExclude: document.getElementById('product-fee-exclude').value.split('\n').map(s => s.trim()).filter(s => s),
    notices: noticeItems.filter(n => n),
    itineraryId: document.getElementById('product-itinerary-select').value || null,
  };
  
  const url = productId ? `${API_BASE}/product/update` : `${API_BASE}/product/create`;
  if (productId) data.productId = productId;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    
    if (result.code === 200) {
      alert('保存成功！');
      closeProductModal();
      loadProducts();
    } else {
      alert('保存失败: ' + result.message);
    }
  } catch (err) {
    alert('保存失败: ' + err.message);
  }
}



// ============ 产品编辑器辅助函数 ============

const DEFAULT_ITINERARY = [
  { day:1, title:'Day1 昆明接机', description:'专车接机，入住酒店，自由活动', meals:'早餐', tags:'专车接机,24h管家' },
  { day:2, title:'Day2 石林景区', description:'游览喀斯特奇观', meals:'早餐,午餐,晚餐', tags:'景区门票,当地导游' },
  { day:3, title:'Day3 大理古城', description:'洱海骑行+古城夜市', meals:'早餐,午餐,晚餐', tags:'洱海骑行,古城夜景' },
  { day:4, title:'Day4 丽江古城', description:'玉龙雪山索道', meals:'早餐,午餐,晚餐', tags:'冰川大索道,蓝月谷' },
  { day:5, title:'Day5 泸沽湖', description:'摩梭族家访', meals:'早餐,午餐,晚餐', tags:'泸沽湖,猪槽船' },
  { day:6, title:'Day6 返程', description:'送机/站，结束行程', meals:'早餐', tags:'专车送机' },
];
const DEFAULT_HIGHLIGHTS = [
  { icon:'🛡️', text:'纯玩0购物' }, { icon:'🏆', text:'金牌导游' },
  { icon:'🏨', text:'精品客栈' }, { icon:'🚗', text:'专车专导' },
];
const DEFAULT_NOTICES = [
  '📅 出行前1-2天，导游会联系您确认接机/接站时间',
  '👗 云南早晚温差大，建议带一件外套，紫外线强请备好防晒',
  '💊 如有特殊疾病或过敏史，请提前告知导游',
  '🏨 酒店入住时间为当日14:00后，退房时间为次日12:00前',
];

function renderItineraryEditor() {
  const c = document.getElementById('itinerary-list');
  c.innerHTML = itineraryDays.map((day, idx) => `
    <div class="itinerary-day">
      <div class="itinerary-day-header">
        <span class="itinerary-day-title">第${day.day}天</span>
        <button type="button" class="itinerary-day-remove" onclick="removeItineraryDay(${idx})">✕</button>
      </div>
      <input type="text" placeholder="标题，如：Day1 昆明接机" value="${day.title || ''}" onchange="updateItinerary(${idx}, 'title', this.value)">
      <textarea placeholder="行程描述..." onchange="updateItinerary(${idx}, 'description', this.value)">${day.description || ''}</textarea>
      <div class="itinerary-day-meta">
        <input type="text" placeholder="餐饮（逗号分隔）" value="${day.meals || ''}" onchange="updateItinerary(${idx}, 'meals', this.value)">
        <input type="text" placeholder="标签（逗号分隔）" value="${day.tags || ''}" onchange="updateItinerary(${idx}, 'tags', this.value)">
      </div>
    </div>
  `).join('');
}

function updateItinerary(idx, field, value) {
  itineraryDays[idx][field] = value;
  if (field === 'title') { const m = value.match(/Day(\d+)/); if (m) itineraryDays[idx].day = parseInt(m[1]); }
}
function addItineraryDay() {
  const next = itineraryDays.length > 0 ? itineraryDays[itineraryDays.length - 1].day + 1 : 1;
  itineraryDays.push({ day: next, title: `Day${next} 待补充`, description: '', meals: '', tags: '' });
  renderItineraryEditor();
}
function removeItineraryDay(idx) { itineraryDays.splice(idx, 1); renderItineraryEditor(); }

function renderHighlightsEditor() {
  const c = document.getElementById('highlights-list');
  c.innerHTML = highlightItems.map((h, idx) => `
    <div class="highlight-row">
      <input type="text" placeholder="图标" value="${h.icon || ''}" style="width:60px;" onchange="updateHighlight(${idx}, 'icon', this.value)">
      <input type="text" placeholder="亮点文字" value="${h.text || ''}" onchange="updateHighlight(${idx}, 'text', this.value)">
      <button type="button" class="btn-remove" onclick="removeHighlight(${idx})">✕</button>
    </div>
  `).join('');
}
function updateHighlight(idx, field, value) { highlightItems[idx][field] = value; }
function addHighlight() { highlightItems.push({ icon: '✨', text: '' }); renderHighlightsEditor(); }
function removeHighlight(idx) { highlightItems.splice(idx, 1); renderHighlightsEditor(); }

function renderNoticesEditor() {
  const c = document.getElementById('notices-list');
  c.innerHTML = noticeItems.map((n, idx) => `
    <div class="notice-row">
      <input type="text" placeholder="须知内容..." value="${n}" style="flex:1;" onchange="updateNotice(${idx}, this.value)">
      <button type="button" class="btn-remove" onclick="removeNotice(${idx})">✕</button>
    </div>
  `).join('');
}
function updateNotice(idx, value) { noticeItems[idx] = value; }
function addNotice() { noticeItems.push(''); renderNoticesEditor(); }
function removeNotice(idx) { noticeItems.splice(idx, 1); renderNoticesEditor(); }

// ============ 出行花絮评价管理（独立API） ============
let reviewList = [];
let currentReviewRating = 5;
let editingReviewId = null;

async function loadReviewList() {
  const showFilter = document.getElementById('review-show-filter')?.value;
  try {
    const res = await fetch(`${API_BASE}/review/list?limit=100${showFilter ? '&show=' + showFilter : ''}`);
    const result = await res.json();
    if (result.code === 200) {
      reviewList = result.data.list || [];
      renderReviewAdminList();
    }
  } catch (err) {
    console.error('加载评价列表失败', err);
  }
}

function renderReviewAdminList() {
  const list = document.getElementById('review-admin-list');
  if (!list) return;
  if (reviewList.length === 0) {
    list.innerHTML = '<div style="color:#999;font-size:13px;text-align:center;padding:30px 0;">暂无评价，点击右上角「添加评价」</div>';
    return;
  }
  list.innerHTML = reviewList.map((r) => `
    <div class="review-admin-card ${r.show === false ? 'hidden' : ''}">
      <img class="review-admin-img" src="${fullUrl(r.image)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 75%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%2275%22/><text x=%2250%22 y=%2240%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>图</text></svg>'">
      <div class="review-admin-body">
        <div class="review-admin-header">
          <img class="review-admin-avatar" src="${r.avatar}" onerror="this.style.display='none'">
          <span class="review-admin-nick">${escapeHtml(r.nickname)}</span>
          <span class="review-admin-stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</span>
        </div>
        <div class="review-admin-content">${escapeHtml(r.content)}</div>
        <div class="review-admin-meta">${r.createdAt ? formatDateTime(r.createdAt) : ''} &nbsp; ${r.show !== false ? '✅ 显示' : '🚫 隐藏'}</div>
      </div>
      <div class="review-admin-actions">
        <label class="review-admin-toggle">
          <input type="checkbox" ${r.show !== false ? 'checked' : ''} onchange="toggleReviewShow('${r._id}', this.checked)">
          显示
        </label>
        <button class="btn btn-sm btn-secondary" onclick="editReview('${r._id}')">编辑</button>
        <button class="btn btn-sm btn-danger" onclick="deleteReview('${r._id}')">删除</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fullUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_BASE.replace('/api', '') + path;
}

function openReviewModal(reviewId) {
  editingReviewId = reviewId;
  currentReviewRating = 5;
  const modal = document.getElementById('review-modal');
  document.getElementById('review-modal-title').textContent = reviewId ? '编辑出行花絮评价' : '添加出行花絮评价';
  document.getElementById('review-edit-id').value = reviewId || '';
  // Reset form
  ['review-nickname','review-avatar','review-content','review-image'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('review-show').checked = true;
  document.getElementById('review-avatar-preview').style.display = 'none';
  document.getElementById('review-image-preview').style.display = 'none';
  if (reviewId) {
    const r = reviewList.find(x => x._id === reviewId);
    if (r) {
      document.getElementById('review-nickname').value = r.nickname || '';
      document.getElementById('review-avatar').value = r.avatar || '';
      document.getElementById('review-content').value = r.content || '';
      document.getElementById('review-image').value = r.image || '';
      document.getElementById('review-show').checked = r.show !== false;
      currentReviewRating = r.rating || 5;
      if (r.avatar) {
        document.getElementById('review-avatar-preview').src = r.avatar;
        document.getElementById('review-avatar-preview').style.display = 'block';
      }
      if (r.image) {
        document.getElementById('review-image-preview').src = r.image;
        document.getElementById('review-image-preview').style.display = 'block';
      }
    }
  }
  updateStarDisplay();
  modal.classList.add('active');
}

function openReviewModalById() { openReviewModal(null); }

function closeReviewModal() {
  document.getElementById('review-modal').classList.remove('active');
  editingReviewId = null;
}

function setReviewRating(val) {
  currentReviewRating = val;
  updateStarDisplay();
}

function updateStarDisplay() {
  const stars = document.querySelectorAll('#review-star-rating .star');
  stars.forEach((s, i) => {
    s.textContent = i < currentReviewRating ? '★' : '☆';
    s.classList.toggle('active', i < currentReviewRating);
  });
  const labels = ['', '很差', '较差', '一般', '满意', '非常满意'];
  document.getElementById('review-rating-text').textContent = labels[currentReviewRating] || '';
}

async function submitReview() {
  const nickname = document.getElementById('review-nickname').value.trim();
  const avatar = document.getElementById('review-avatar').value.trim();
  const content = document.getElementById('review-content').value.trim();
  const image = document.getElementById('review-image').value.trim();
  const show = document.getElementById('review-show').checked;
  if (!nickname) { alert('请输入买家昵称'); return; }
  if (!avatar) { alert('请输入买家头像URL'); return; }
  if (!content) { alert('请输入评价内容'); return; }
  if (!image) { alert('请输入花絮图片URL'); return; }
  const data = { nickname, avatar, rating: currentReviewRating, content, image, show };
  try {
    let res, result;
    if (editingReviewId) {
      res = await fetch(`${API_BASE}/review/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: editingReviewId, ...data })
      });
    } else {
      res = await fetch(`${API_BASE}/review/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    result = await res.json();
    if (result.code === 200) {
      alert(editingReviewId ? '更新成功' : '添加成功');
      closeReviewModal();
      loadReviewList();
    } else {
      alert(result.message || '操作失败');
    }
  } catch (err) {
    alert('操作失败: ' + err.message);
  }
}

function editReview(reviewId) { openReviewModal(reviewId); }

async function deleteReview(reviewId) {
  if (!confirm('确认删除这条评价？')) return;
  try {
    const res = await fetch(`${API_BASE}/review/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId })
    });
    const result = await res.json();
    if (result.code === 200) {
      alert('删除成功');
      loadReviewList();
    } else {
      alert(result.message || '删除失败');
    }
  } catch (err) {
    alert('删除失败');
  }
}

async function toggleReviewShow(reviewId, show) {
  try {
    await fetch(`${API_BASE}/review/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, show })
    });
  } catch (err) {
    console.error('更新显示状态失败', err);
  }
}

function handleReviewAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('review-avatar').value = e.target.result;
    document.getElementById('review-avatar-preview').src = e.target.result;
    document.getElementById('review-avatar-preview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function handleReviewImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('图片不超过5MB'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('review-image').value = e.target.result;
    document.getElementById('review-image-preview').src = e.target.result;
    document.getElementById('review-image-preview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}


// ============ 首页装修 ============
let decorateProducts = [];

async function loadHomeDecorate() {
  await loadDecorateProductList();
  // 加载已有配置
  try {
    const res = await fetch(`${API_BASE}/homeConfig/get`);
    const result = await res.json();
    if (result.code === 200 && result.data) {
      document.getElementById('decorate-banner-url').value = result.data.bannerImage || '';
      document.getElementById('decorate-product-select').value = result.data.linkedProductId || '';
      document.getElementById('decorate-butler-phones').value = result.data.butlerPhones || '';
      document.getElementById('decorate-butler-wechats').value = result.data.butlerWechats || '';
      updateDecoratePreview(result.data.bannerImage, result.data.linkedProductName);
    } else {
      updateDecoratePreview('', '');
    }
  } catch (err) {
    console.error('加载首页配置失败', err);
  }
}

async function loadDecorateProductList() {
  try {
    const res = await fetch(`${API_BASE}/homeConfig/products`);
    const result = await res.json();
    if (result.code === 200) {
      decorateProducts = result.data || [];
      const select = document.getElementById('decorate-product-select');
      select.innerHTML = '<option value="">-- 选择关联产品 --</option>';
      decorateProducts.forEach(p => {
        const price = p.promotionPrice || p.price;
        select.innerHTML += `<option value="${p._id}">${p.name}（¥${price}）</option>`;
      });
    }
  } catch (err) {
    console.error('加载产品列表失败', err);
  }
}

function updateDecoratePreview(bannerUrl, productName) {
  const preview = document.getElementById('decorate-banner-preview');
  const productPreview = document.getElementById('decorate-product-preview');
  if (bannerUrl) {
    preview.innerHTML = `<img src="${fullUrl(bannerUrl)}" style="max-width:100%;max-height:200px;border-radius:8px;">`;
  } else {
    preview.innerHTML = '<span style="color:#bbb;font-size:13px;">暂无海报</span>';
  }
  productPreview.textContent = productName ? `关联产品：${productName}` : '';
}

function uploadDecorateBanner() {
  document.getElementById('decorate-banner-input').click();
}

function handleDecorateBannerUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('图片不超过5MB'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    document.getElementById('decorate-banner-url').value = base64;
    updateDecoratePreview(base64, document.getElementById('decorate-product-preview').textContent.replace('关联产品：', ''));
  };
  reader.readAsDataURL(file);
}

async function saveHomeDecorate() {
  const bannerImage = document.getElementById('decorate-banner-url').value.trim();
  const productId = document.getElementById('decorate-product-select').value;
  const productName = productId ? document.querySelector(`#decorate-product-select option[value="${productId}"]`).textContent.split('（')[0] : '';
  const butlerPhones = document.getElementById('decorate-butler-phones').value.trim();
  const butlerWechats = document.getElementById('decorate-butler-wechats').value.trim();
  try {
    const res = await fetch(`${API_BASE}/homeConfig/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannerImage, linkedProductId: productId || null, linkedProductName: productName, butlerPhones, butlerWechats })
    });
    const result = await res.json();
    if (result.code === 200) {
      alert('保存成功');
    } else {
      alert('保存失败：' + result.message);
    }
  } catch (err) {
    alert('保存失败：' + err.message);
  }
}

// 监听产品选择变化，更新预览
document.getElementById('decorate-product-select')?.addEventListener('change', function() {
  const selected = this.options[this.selectedIndex];
  const name = this.value ? selected.textContent.split('（')[0] : '';
  const bannerUrl = document.getElementById('decorate-banner-url').value.trim();
  updateDecoratePreview(bannerUrl, name);
});

// 监听URL输入变化，更新预览
document.getElementById('decorate-banner-url')?.addEventListener('input', function() {
  const productName = document.getElementById('decorate-product-select').value
    ? document.querySelector(`#decorate-product-select option[value="${document.getElementById('decorate-product-select').value}"]`).textContent.split('（')[0]
    : '';
  updateDecoratePreview(this.value.trim(), productName);
});


// ========== 行程管理 ==========
let currentEditingItinerary = null;
let itineraryMgmtDays = [];
let itineraryMgmtHighlights = [];
let itineraryMgmtNotices = [];

const DEFAULT_ITINERARY_DAYS = [
  { day:1, title:'Day1 昆明接机', description:'专车接机，入住酒店，自由活动', meals:'早餐', tags:'专车接机,24h管家' },
  { day:2, title:'Day2 石林景区', description:'游览喀斯特奇观', meals:'早餐,午餐,晚餐', tags:'景区门票,当地导游' },
  { day:3, title:'Day3 大理古城', description:'洱海骑行+古城夜市', meals:'早餐,午餐,晚餐', tags:'洱海骑行,古城夜景' },
  { day:4, title:'Day4 丽江古城', description:'玉龙雪山索道', meals:'早餐,午餐,晚餐', tags:'冰川大索道,蓝月谷' },
  { day:5, title:'Day5 泸沽湖', description:'摩梭族家访', meals:'早餐,午餐,晚餐', tags:'泸沽湖,猪槽船' },
  { day:6, title:'Day6 返程', description:'送机/站，结束行程', meals:'早餐', tags:'专车送机' },
];
const DEFAULT_ITINERARY_HIGHLIGHTS = [
  { icon:'🛡️', text:'纯玩0购物' }, { icon:'🏆', text:'金牌导游' },
  { icon:'🏨', text:'精品客栈' }, { icon:'🚗', text:'专车专导' },
];
const DEFAULT_ITINERARY_NOTICES = [
  '📅 出行前1-2天，导游会联系您确认接机/接站时间',
  '👗 云南早晚温差大，建议带一件外套，紫外线强请备好防晒',
  '💊 如有特殊疾病或过敏史，请提前告知导游',
  '🏨 酒店入住时间为当日14:00后，退房时间为次日12:00前',
];

async function loadItineraryList() {
  try {
    const res = await fetch(`${API_BASE}/itinerary/all`);
    const result = await res.json();
    if (result.code === 200) {
      renderItineraryTable(result.data);
    } else {
      alert('加载行程列表失败: ' + result.message);
    }
  } catch (err) {
    console.error('加载行程列表失败:', err);
  }
}

function renderItineraryTable(itineraries) {
  const tbody = document.getElementById('itinerary-list');
  if (!itineraries || itineraries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:40px;">暂无行程，请点击"新增行程"创建</td></tr>';
    return;
  }
  tbody.innerHTML = itineraries.map(it => `
    <tr>
      <td>${it.name}</td>
      <td>${it.duration || '-'}</td>
      <td>${(it.destinations || []).join('、') || '-'}</td>
      <td>
        <span class="status-badge ${it.status === 1 ? 'status-paid' : 'status-cancelled'}">
          ${it.status === 1 ? '启用' : '禁用'}
        </span>
      </td>
      <td>${it.sort || 0}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-primary" onclick="editItinerary('${it._id}')">编辑</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItinerary('${it._id}')">删除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openItineraryModal(itineraryId) {
  currentEditingItinerary = null;
  itineraryMgmtDays = DEFAULT_ITINERARY_DAYS.map(d => ({ ...d }));
  itineraryMgmtHighlights = DEFAULT_ITINERARY_HIGHLIGHTS.map(h => ({ ...h }));
  itineraryMgmtNotices = [...DEFAULT_ITINERARY_NOTICES];

  // 重置表单
  document.getElementById('itinerary-id').value = '';
  document.getElementById('itinerary-name').value = '';
  document.getElementById('itinerary-description').value = '';
  document.getElementById('itinerary-duration').value = '';
  document.getElementById('itinerary-destinations').value = '';
  document.getElementById('itinerary-sort').value = '0';
  document.getElementById('itinerary-fee-include').value = '';
  document.getElementById('itinerary-fee-exclude').value = '';

  renderItineraryDaysEditor();
  renderItineraryHighlightsEditor();
  renderItineraryNoticesEditor();

  if (itineraryId) {
    document.getElementById('itinerary-modal-title').textContent = '编辑行程';
    loadItineraryDetail(itineraryId);
  } else {
    document.getElementById('itinerary-modal-title').textContent = '新增行程';
  }
  document.getElementById('itinerary-modal').classList.add('active');
}

function closeItineraryModal() {
  document.getElementById('itinerary-modal').classList.remove('active');
  currentEditingItinerary = null;
}

function editItinerary(itineraryId) {
  openItineraryModal(itineraryId);
}

async function loadItineraryDetail(itineraryId) {
  try {
    const res = await fetch(`${API_BASE}/itinerary/detail?itineraryId=${itineraryId}`);
    const result = await res.json();
    if (result.code === 200) {
      const it = result.data;
      currentEditingItinerary = it;
      document.getElementById('itinerary-id').value = it._id;
      document.getElementById('itinerary-name').value = it.name || '';
      document.getElementById('itinerary-description').value = it.description || '';
      document.getElementById('itinerary-duration').value = it.duration || '';
      document.getElementById('itinerary-destinations').value = (it.destinations || []).join('、');
      document.getElementById('itinerary-sort').value = it.sort || 0;
      document.getElementById('itinerary-fee-include').value = (it.feeInclude || []).join('\n');
      document.getElementById('itinerary-fee-exclude').value = (it.feeExclude || []).join('\n');

      // 行程编辑器
      itineraryMgmtDays = (it.days && it.days.length > 0)
        ? it.days.map(d => ({ day: d.day || 1, title: d.title || '', description: d.description || '', meals: d.meals || '', tags: d.tags || '' }))
        : DEFAULT_ITINERARY_DAYS.map(d => ({ ...d }));
      // 亮点编辑器
      itineraryMgmtHighlights = (it.highlights && it.highlights.length > 0)
        ? it.highlights.map(h => ({ icon: h.icon || '', text: h.text || '' }))
        : DEFAULT_ITINERARY_HIGHLIGHTS.map(h => ({ ...h }));
      // 须知编辑器
      itineraryMgmtNotices = (it.notices && it.notices.length > 0) ? [...it.notices] : [...DEFAULT_ITINERARY_NOTICES];

      renderItineraryDaysEditor();
      renderItineraryHighlightsEditor();
      renderItineraryNoticesEditor();
    } else {
      alert('加载行程详情失败');
    }
  } catch (err) {
    alert('加载行程详情失败');
  }
}

function renderItineraryDaysEditor() {
  const c = document.getElementById('itinerary-days-editor');
  c.innerHTML = itineraryMgmtDays.map((day, idx) => `
    <div class="itinerary-day">
      <div class="itinerary-day-header">
        <span class="itinerary-day-title">第${day.day}天</span>
        <button type="button" class="itinerary-day-remove" onclick="removeItineraryDay(${idx})">✕</button>
      </div>
      <input type="text" placeholder="标题，如：Day1 昆明接机" value="${day.title || ''}" onchange="updateItineraryDay(${idx}, 'title', this.value)">
      <textarea placeholder="行程描述..." onchange="updateItineraryDay(${idx}, 'description', this.value)">${day.description || ''}</textarea>
      <div class="itinerary-day-meta">
        <input type="text" placeholder="餐饮（逗号分隔）" value="${day.meals || ''}" onchange="updateItineraryDay(${idx}, 'meals', this.value)">
        <input type="text" placeholder="标签（逗号分隔）" value="${day.tags || ''}" onchange="updateItineraryDay(${idx}, 'tags', this.value)">
      </div>
    </div>
  `).join('');
}

function updateItineraryDay(idx, field, value) {
  itineraryMgmtDays[idx][field] = value;
  if (field === 'title') {
    const m = value.match(/Day(\d+)/);
    if (m) itineraryMgmtDays[idx].day = parseInt(m[1]);
  }
}

function addItineraryDay() {
  const next = itineraryMgmtDays.length > 0 ? itineraryMgmtDays[itineraryMgmtDays.length - 1].day + 1 : 1;
  itineraryMgmtDays.push({ day: next, title: `Day${next} 待补充`, description: '', meals: '', tags: '' });
  renderItineraryDaysEditor();
}

function removeItineraryDay(idx) {
  itineraryMgmtDays.splice(idx, 1);
  renderItineraryDaysEditor();
}

function renderItineraryHighlightsEditor() {
  const c = document.getElementById('itinerary-highlights-editor');
  c.innerHTML = itineraryMgmtHighlights.map((h, idx) => `
    <div class="highlight-row">
      <input type="text" placeholder="图标" value="${h.icon || ''}" style="width:60px;" onchange="updateItineraryHighlight(${idx}, 'icon', this.value)">
      <input type="text" placeholder="亮点文字" value="${h.text || ''}" onchange="updateItineraryHighlight(${idx}, 'text', this.value)">
      <button type="button" class="btn-remove" onclick="removeItineraryHighlight(${idx})">✕</button>
    </div>
  `).join('');
}

function updateItineraryHighlight(idx, field, value) {
  itineraryMgmtHighlights[idx][field] = value;
}

function addItineraryHighlight() {
  itineraryMgmtHighlights.push({ icon: '✨', text: '' });
  renderItineraryHighlightsEditor();
}

function removeItineraryHighlight(idx) {
  itineraryMgmtHighlights.splice(idx, 1);
  renderItineraryHighlightsEditor();
}

function renderItineraryNoticesEditor() {
  const c = document.getElementById('itinerary-notices-editor');
  c.innerHTML = itineraryMgmtNotices.map((n, idx) => `
    <div class="notice-row">
      <input type="text" placeholder="须知内容..." value="${n}" style="flex:1;" onchange="updateItineraryNotice(${idx}, this.value)">
      <button type="button" class="btn-remove" onclick="removeItineraryNotice(${idx})">✕</button>
    </div>
  `).join('');
}

function updateItineraryNotice(idx, value) {
  itineraryMgmtNotices[idx] = value;
}

function addItineraryNotice() {
  itineraryMgmtNotices.push('');
  renderItineraryNoticesEditor();
}

function removeItineraryNotice(idx) {
  itineraryMgmtNotices.splice(idx, 1);
  renderItineraryNoticesEditor();
}

async function submitItinerary() {
  const name = document.getElementById('itinerary-name').value.trim();
  if (!name) {
    alert('请输入行程名称');
    return;
  }

  const feeInclude = document.getElementById('itinerary-fee-include').value.trim()
    .split('\n').filter(n => n.trim());
  const feeExclude = document.getElementById('itinerary-fee-exclude').value.trim()
    .split('\n').filter(n => n.trim());
  const destinations = document.getElementById('itinerary-destinations').value.trim()
    .split('、').filter(d => d.trim());

  const data = {
    name,
    description: document.getElementById('itinerary-description').value.trim(),
    duration: document.getElementById('itinerary-duration').value.trim(),
    destinations,
    sort: parseInt(document.getElementById('itinerary-sort').value) || 0,
    days: itineraryMgmtDays,
    feeInclude,
    feeExclude,
    highlights: itineraryMgmtHighlights.filter(h => h.text),
    notices: itineraryMgmtNotices.filter(n => n),
  };

  const itineraryId = document.getElementById('itinerary-id').value;
  const url = itineraryId ? `${API_BASE}/itinerary/update` : `${API_BASE}/itinerary/create`;
  const body = itineraryId ? { itineraryId, ...data } : data;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    if (result.code === 200) {
      alert(itineraryId ? '更新成功' : '创建成功');
      closeItineraryModal();
      loadItineraryList();
    } else {
      alert('保存失败：' + result.message);
    }
  } catch (err) {
    alert('保存失败：' + err.message);
  }
}

async function deleteItinerary(itineraryId) {
  if (!confirm('确认删除该行程？删除后不可恢复')) return;
  try {
    const res = await fetch(`${API_BASE}/itinerary/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itineraryId })
    });
    const result = await res.json();
    if (result.code === 200) {
      alert('删除成功');
      loadItineraryList();
    } else {
      alert('删除失败：' + result.message);
    }
  } catch (err) {
    alert('删除失败：' + err.message);
  }
}


if (localStorage.getItem('adminLoggedIn') === 'true') {
  showAdminPage();
} else {
  showLoginPage();
}
