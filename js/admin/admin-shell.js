const ADMIN_PAGES = [
  ['index.html', 'overview', 'dashboard'],
  ['products.html', 'products', 'inventory_2'],
  ['inventory.html', 'inventory', 'warehouse'],
  ['orders.html', 'orders', 'receipt_long'],
  ['customers.html', 'customers', 'group'],
  ['coupons.html', 'coupons', 'sell'],
  ['cms.html', 'cms', 'edit_note'],
  ['content.html', 'content', 'quiz'],
  ['settings.html', 'settings', 'settings']
];

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

function renderShell(content) {
  const page = document.body.dataset.adminPage || 'overview';
  const session = AdminAuth.session() || {};
  const now = new Date().toLocaleString(adminLang() === 'en' ? 'en-GB' : 'ar-OM', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  return `
    <aside class="admin-side" id="admin-side">
      <div class="admin-brand">
        <div class="admin-mark"><span class="material-symbols-outlined">memory</span></div>
        <div>
          <strong>${escapeAdmin(t('brand'))}</strong>
          <span>${escapeAdmin(t('brandSub'))}</span>
        </div>
      </div>
      <nav class="admin-nav">
        ${ADMIN_PAGES.map(([href, key, icon]) => `
          <a class="${page === key ? 'is-active' : ''}" href="${href}">
            <span class="material-symbols-outlined">${icon}</span>${escapeAdmin(t(key))}
          </a>
        `).join('')}
      </nav>
      <div class="admin-side-foot">
        <span class="ad-chip">${escapeAdmin(t('live'))}</span>
        <small>${escapeAdmin(now)}</small>
      </div>
    </aside>
    <section class="admin-main">
      <div class="admin-top">
        <div class="admin-top-title">
          <button type="button" class="ad-ghost admin-menu" id="admin-menu" aria-label="menu">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h1>${escapeAdmin(t(page))}</h1>
            <p>${escapeAdmin(adminLang() === 'en' ? (session.nameEn || session.user || '') : (session.name || session.user || ''))}</p>
          </div>
        </div>
        <div class="admin-actions">
          <button type="button" class="ad-ghost" id="admin-lang">${escapeAdmin(t('lang'))}</button>
          <a class="ad-ghost" href="${AdminAuth.storefrontHome()}">${escapeAdmin(t('store'))}</a>
          <button type="button" class="ad-danger" id="admin-logout">${escapeAdmin(t('logout'))}</button>
        </div>
      </div>
      <div id="admin-page">${content}</div>
    </section>
  `;
}

function mountAdmin(content) {
  applyAdminDir();
  const root = document.getElementById('admin-app');
  if (!root) return;
  root.innerHTML = renderShell(content);
  document.getElementById('admin-lang')?.addEventListener('click', () => {
    StoreState.setLang(adminLang() === 'ar' ? 'en' : 'ar');
    window.renderAdminPage();
  });
  document.getElementById('admin-logout')?.addEventListener('click', () => {
    AdminAuth.logout();
    window.location.href = AdminAuth.storefrontHome();
  });
  document.getElementById('admin-menu')?.addEventListener('click', () => {
    document.getElementById('admin-side')?.classList.toggle('is-open');
  });
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
