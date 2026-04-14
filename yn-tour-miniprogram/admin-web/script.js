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
  document.getElementById('review-result').addEventListener('change', (e) => {
    const rejectReasonGroup = document.getElementById('reject-reason-group');
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
    products: '产品管理'
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
              <button class="btn btn-sm btn-success" onclick="openReviewModal('${withdraw._id}')">审核</button>
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

// 打开审核弹窗
function openReviewModal(withdrawId) {
  currentWithdrawId = withdrawId;
  document.getElementById('review-result').value = 'approve';
  document.getElementById('reject-reason').value = '';
  document.getElementById('reject-reason-group').classList.remove('show');
  document.getElementById('review-modal').classList.add('active');
}

// 关闭弹窗
function closeModal() {
  document.getElementById('review-modal').classList.remove('active');
  currentWithdrawId = null;
}

// 提交审核
async function submitReview() {
  if (!currentWithdrawId) return;
  
  const reviewResult = document.getElementById('review-result').value;
  const rejectReason = document.getElementById('reject-reason').value;
  
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
      closeModal();
      loadWithdraws();
      loadDashboard();
    } else {
      alert(result.message || '审核失败');
    }
  } catch (err) {
    console.error('审核失败:', err);
    alert('审核操作成功（模拟）');
    closeModal();
    loadWithdraws();
    loadDashboard();
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
let productImageUrls = [];

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
        <div style="font-size:12px;">
          <div>一级: ${((product.commission?.level1 || 0) * 100).toFixed(0)}%</div>
          <div>二级: ${((product.commission?.level2 || 0) * 100).toFixed(0)}%</div>
        </div>
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

function openProductModal(productId) {
  currentEditingProduct = null;
  productImageUrls = [];
  
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
  document.getElementById('product-is-promotion').value = 'false';
  document.getElementById('product-promotion-price').value = '';
  document.getElementById('product-promotion-end').value = '';
  document.getElementById('product-images').value = '';
  
  // 重置图片预览
  document.getElementById('product-image-placeholder').style.display = 'flex';
  document.getElementById('product-image-preview').style.display = 'none';
  document.getElementById('product-image-img').src = '';
  
  if (productId) {
    document.getElementById('product-modal-title').textContent = '编辑产品';
    loadProductDetail(productId);
  } else {
    document.getElementById('product-modal-title').textContent = '新增产品';
  }
  
  document.getElementById('product-modal').classList.add('active');
  
  // 点击上传区域触发文件选择
  document.getElementById('product-image-placeholder').onclick = () => {
    document.getElementById('product-image-input').click();
  };
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
      document.getElementById('product-is-promotion').value = String(!!p.isPromotion);
      document.getElementById('product-promotion-price').value = p.promotionPrice || '';
      document.getElementById('product-promotion-end').value = p.promotionEnd ? p.promotionEnd.split('T')[0] : '';
      
      // 图片
      productImageUrls = p.images || [];
      if (productImageUrls.length > 0) {
        document.getElementById('product-image-placeholder').style.display = 'none';
        document.getElementById('product-image-preview').style.display = 'flex';
        document.getElementById('product-image-img').src = productImageUrls[0];
      }
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

async function handleProductImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await fetch(`${API_BASE}/product/upload-image`, {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    
    if (result.code === 200) {
      productImageUrls = [result.data.url];
      document.getElementById('product-images').value = JSON.stringify(productImageUrls);
      document.getElementById('product-image-placeholder').style.display = 'none';
      document.getElementById('product-image-preview').style.display = 'flex';
      document.getElementById('product-image-img').src = result.data.url;
    } else {
      alert('上传失败: ' + result.message);
    }
  } catch (err) {
    alert('上传失败: ' + err.message);
  }
  
  // 清空input以便重复选择同一文件
  event.target.value = '';
}

function removeProductImage() {
  productImageUrls = [];
  document.getElementById('product-images').value = '';
  document.getElementById('product-image-placeholder').style.display = 'flex';
  document.getElementById('product-image-preview').style.display = 'none';
  document.getElementById('product-image-img').src = '';
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
  
  if (isNaN(level1) || level1 < 0 || level1 > 1) {
    alert('请输入正确的一级分销比例（0-1之间）');
    return;
  }
  if (isNaN(level2) || level2 < 0 || level2 > 1) {
    alert('请输入正确的二级分销比例（0-1之间）');
    return;
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
    commission: {
      level1,
      level2
    },
    isPromotion: document.getElementById('product-is-promotion').value === 'true',
    promotionPrice: parseFloat(document.getElementById('product-promotion-price').value) || 0,
    promotionEnd: document.getElementById('product-promotion-end').value || null,
    images: productImageUrls
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

// 检查登录状态
if (localStorage.getItem('adminLoggedIn') === 'true') {
  showAdminPage();
} else {
  showLoginPage();
}
