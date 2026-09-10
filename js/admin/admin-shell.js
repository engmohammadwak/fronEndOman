const ADMIN_PAGES = [
  ['overview', 'overview', 'dashboard'],
  ['products', 'products', 'inventory_2'],
  ['inventory', 'inventory', 'warehouse'],
  ['orders', 'orders', 'shopping_bag'],
  ['customers', 'customers', 'people'],
  ['coupons', 'coupons', 'sell'],
  ['cms', 'cms', 'edit_note'],
  ['content', 'content', 'support_agent'],
  ['settings', 'settings', 'settings'],
  ['payments', 'payments', 'account_balance']
];

const SIDEBAR_KEY = 'techpro_admin_sidebar_collapsed';

function adminToast(message) {
  document.getElementById('admin-toast')?.remove();
  const node = document.createElement('div');
  node.id = 'admin-toast';
  node.className = 'admin-toast';
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2200);
}

function money(value) {
  const settings = StoreState.getSettings();
  const unit = adminLang() === 'en' ? settings.currencyEn : settings.currencyAr;
  return `${Number(value || 0).toLocaleString()} ${unit}`;
}

function escapeAdmin(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusLabel(status) {
  const key = ['received', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status) ? status : 'processing';
  return t(key);
}

function pageDescription(page) {
  if (adminLang() === 'en') {
    return {
      overview: 'Welcome to the control panel',
      products: 'Manage catalog and pricing',
      inventory: 'Live warehouse stock',
      orders: 'Track and fulfill orders',
      customers: 'Customer activity overview',
      coupons: 'Promotions and discount codes',
      cms: 'Storefront copy and banners',
      content: 'FAQ, branches, and policies',
      settings: 'Store configuration',
      payments: 'Paymob gateway credentials'
    }[page] || 'Admin workspace';
  }
  return {
    overview: 'مرحباً بك في لوحة التحكم',
    products: 'إدارة الكتالوج والأسعار',
    inventory: 'المخزون الحي من المستودع',
    orders: 'متابعة وتنفيذ الطلبات',
    customers: 'نظرة على نشاط العملاء',
    coupons: 'العروض وأكواد الخصم',
    cms: 'نصوص وبانرات المتجر',
    content: 'الأسئلة والفروع والسياسات',
    settings: 'إعدادات المتجر',
    payments: 'بيانات بوابة Paymob'
  }[page] || 'مساحة الإدارة';
}

function restoreSidebarState() {
  try {
    if (localStorage.getItem(SIDEBAR_KEY) === '1') document.body.classList.add('sidebar-collapsed');
    else document.body.classList.remove('sidebar-collapsed');
  } catch {
    document.body.classList.remove('sidebar-collapsed');
  }
}

function toggleDesktopSidebar() {
  document.body.classList.toggle('sidebar-collapsed');
  try {
    localStorage.setItem(SIDEBAR_KEY, document.body.classList.contains('sidebar-collapsed') ? '1' : '0');
  } catch {}
}

function notificationsMarkup() {
  const items = AdminLayout.buildNotifications();
  const unread = AdminLayout.unreadCount(items);
  return `
    <div class="notify-wrap">
      <button type="button" class="icon-btn" id="admin-notify-btn" aria-label="${escapeAdmin(t('notifications'))}">
        <span class="material-symbols-outlined">notifications</span>
        ${unread ? `<span class="notify-badge">${unread}</span>` : ''}
      </button>
      <div class="notify-panel" id="admin-notify-panel" hidden>
        <div class="notify-panel-head">
          <span>${escapeAdmin(t('notifications'))}</span>
          <button type="button" class="ad-ghost" id="admin-notify-read">${escapeAdmin(t('markRead'))}</button>
        </div>
        ${items.length ? (() => {
          let readIds = [];
          try { readIds = JSON.parse(localStorage.getItem('techpro_admin_notify_read') || '{"read":[]}').read || []; } catch { readIds = []; }
          if (!Array.isArray(readIds)) readIds = [];
          const read = new Set(readIds);
          return items.map((item) => `
          <a class="notify-item ${read.has(item.id) ? '' : 'is-unread'}" href="${escapeAdmin(item.href)}" data-notify-id="${escapeAdmin(item.id)}">
            ${escapeAdmin(item.title)}
          </a>`).join('');
        })() : `<p class="notify-empty">${escapeAdmin(t('noNotifications'))}</p>`}
      </div>
    </div>
  `;
}

function renderShell(content) {
  const page = document.body.dataset.adminPage || 'overview';
  const session = AdminAuth.session() || {};
  const userLabel = adminLang() === 'en'
    ? (session.nameEn || session.user || session.email || 'Admin')
    : (session.name || session.user || session.email || 'المدير');
  restoreSidebarState();
  return `
    <aside class="sidebar admin-side" id="admin-side">
      <div class="sidebar-header">
        <div class="brand-icon">
          <img class="brand-logo-img" data-brand-logo src="${escapeAdmin(StoreState.adminLogoUrl())}" alt="">
        </div>
        <div>
          <h1 class="brand-name" data-brand-name>${escapeAdmin(StoreState.storeDisplayName(adminLang()))}</h1>
          <span class="brand-sub">${escapeAdmin(t('brandSub'))}</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${ADMIN_PAGES.map(([, key, icon]) => `
          <a class="nav-link ${page === key ? 'active' : ''}" href="${AdminAuth.adminPath(key)}">
            <span class="material-symbols-outlined">${icon}</span>
            <span>${escapeAdmin(t(key))}</span>
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <a class="nav-link" href="${AdminAuth.storefrontHome()}">
          <span class="material-symbols-outlined">storefront</span>
          <span>${escapeAdmin(t('store'))}</span>
        </a>
        <button type="button" class="logout-btn is-danger" id="admin-logout">
          <span class="material-symbols-outlined">logout</span>
          <span>${escapeAdmin(t('logout'))}</span>
        </button>
      </div>
    </aside>
    <header class="topbar">
      <div class="topbar-content" style="display:flex;align-items:center;gap:0.75rem;">
        <button type="button" class="mobile-menu-btn" id="admin-menu" aria-label="menu">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <button type="button" class="icon-btn sidebar-toggle-btn" id="admin-sidebar-toggle" aria-label="${escapeAdmin(t('toggleSidebar'))}">
          <span class="material-symbols-outlined">view_sidebar</span>
        </button>
        <div>
          <h2 class="page-title">${escapeAdmin(t(page))}</h2>
          <p class="page-desc">${escapeAdmin(pageDescription(page))}</p>
        </div>
      </div>
      <div class="topbar-actions">
        <button type="button" class="icon-btn" id="admin-lang" title="${escapeAdmin(t('lang'))}">
          <span class="material-symbols-outlined">language</span>
        </button>
        ${notificationsMarkup()}
        <div class="user-profile">
          <span class="user-name">${escapeAdmin(userLabel)}</span>
          <span class="material-symbols-outlined">account_circle</span>
        </div>
      </div>
    </header>
    <main class="main-content admin-main">
      <div id="admin-page">${content}</div>
    </main>
  `;
}

function bindNotifications() {
  const btn = document.getElementById('admin-notify-btn');
  const panel = document.getElementById('admin-notify-panel');
  if (!btn || !panel) return;
  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', open);
    panel.hidden = !open;
  });
  document.getElementById('admin-notify-read')?.addEventListener('click', (event) => {
    event.stopPropagation();
    const ids = AdminLayout.buildNotifications().map((item) => item.id);
    AdminLayout.markNotificationsRead(ids);
    window.renderAdminPage();
  });
  document.addEventListener('click', (event) => {
    if (!panel.classList.contains('is-open')) return;
    if (event.target.closest('.notify-wrap')) return;
    panel.classList.remove('is-open');
    panel.hidden = true;
  }, { once: true });
}

function mountAdmin(content) {
  applyAdminDir();
  const root = document.getElementById('admin-app');
  if (!root) return;
  root.innerHTML = renderShell(content);
  StoreState.applyDocumentBranding({
    admin: true,
    lang: adminLang(),
    titleSuffix: adminLang() === 'en' ? 'Admin' : 'لوحة التحكم'
  });
  document.getElementById('admin-lang')?.addEventListener('click', () => {
    StoreState.setLang(adminLang() === 'ar' ? 'en' : 'ar');
    window.renderAdminPage();
  });
  document.getElementById('admin-logout')?.addEventListener('click', async () => {
    try { await AdminAuth.logout(); } catch { adminToast('تعذّر تسجيل الخروج / Sign-out failed'); return; }
    window.location.href = AdminAuth.adminPath('login');
  });
  document.getElementById('admin-menu')?.addEventListener('click', () => {
    document.getElementById('admin-side')?.classList.toggle('open');
    document.getElementById('admin-side')?.classList.toggle('is-open');
  });
  document.getElementById('admin-sidebar-toggle')?.addEventListener('click', toggleDesktopSidebar);
  bindNotifications();
}

function adminModal(inner) {
  let host = document.getElementById('admin-modal');
  if (!host) {
    host = document.createElement('div');
    host.id = 'admin-modal';
    host.className = 'ad-modal';
    document.body.appendChild(host);
  }
  host.innerHTML = `<div class="ad-modal-card">${inner}</div>`;
  host.classList.add('is-open');
  host.onclick = (event) => {
    if (event.target === host) host.classList.remove('is-open');
  };
  return host;
}

function closeAdminModal() {
  document.getElementById('admin-modal')?.classList.remove('is-open');
}

window.toggleSidebar = function toggleSidebar() {
  if (window.matchMedia('(max-width: 860px)').matches) {
    document.getElementById('admin-side')?.classList.toggle('open');
    document.getElementById('admin-side')?.classList.toggle('is-open');
    return;
  }
  toggleDesktopSidebar();
};
