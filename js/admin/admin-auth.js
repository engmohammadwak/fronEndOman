const AdminAuth = (() => {
  let currentSession = null;
  let revision = 0;
  let status = 'idle';
  let initialization = null;

  async function sessionRequest(path, options = {}) {
    const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000), ...options });
    if (response.status === 401) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || 'Authentication service unavailable');
    // Explicit anonymous probe from login page / logged-out state.
    if (data && data.ok === false) return null;
    return data;
  }

  function session() { return currentSession; }
  function normalizeSession(data) {
    if (data === null) return null;
    if (!data || data.ok !== true || typeof data.email !== 'string' || !data.email.trim()) {
      throw new Error('Invalid authentication response');
    }
    return {email:data.email, user:data.email, name:data.email, nameEn:data.email};
  }

  function showStatus(nextStatus) {
    status = nextStatus;
    const app = document.getElementById('admin-app');
    if (!app) return;
    app.hidden = false;
    app.setAttribute('aria-busy', String(nextStatus === 'loading'));
    app.replaceChildren();
    const message = document.createElement('p');
    message.setAttribute('role', nextStatus === 'error' ? 'alert' : 'status');
    message.textContent = nextStatus === 'error'
      ? 'تعذّر التحقق من الجلسة. لم يتم تسجيل خروجك. / Session verification unavailable.'
      : 'جاري التحقق من الجلسة… / Checking your session…';
    app.appendChild(message);
    if (nextStatus === 'error') {
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'إعادة المحاولة / Retry';
      retry.addEventListener('click', () => boot());
      app.appendChild(retry);
    }
  }

  async function login(email, password) {
    const operation = ++revision;
    const data = await sessionRequest('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (operation !== revision) return false;
    currentSession = normalizeSession(data);
    status = currentSession ? 'authenticated' : 'anonymous';
    return !!currentSession;
  }

  async function logout() {
    const operation = ++revision;
    await sessionRequest('/api/admin/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    if (operation !== revision) return;
    currentSession = null;
    status = 'anonymous';
    try {
      localStorage.setItem('techpro_admin_session', 'null');
      sessionStorage.removeItem('techpro_admin_session');
    } catch {}
  }

  function adminPath(page) {
    if (typeof AppRoutes !== 'undefined' && AppRoutes.admin) return AppRoutes.admin(page);
    return page === 'login' ? '/dashboard' : (page === 'overview' || page === 'home' ? '/dashboard/home' : `/dashboard/${page}`);
  }

  function pageFromLocation() {
    const path = (window.location.pathname || '').replace(/\/+$/, '') || '/';
    if (path === '/dashboard' || path.endsWith('/login.html')) return 'login';
    const slug = path.split('/').pop();
    const keys = ['home', 'pos', 'products', 'categories', 'inventory', 'orders', 'customers', 'coupons', 'cms', 'content', 'settings', 'payments'];
    if (slug === 'home' || slug === 'overview') return session() ? 'overview' : 'login';
    if (keys.includes(slug)) return session() ? slug : 'login';
    if (document.body.dataset.adminPage && document.body.dataset.adminPage !== 'login' && path.includes('/pages/admin/')) {
      return session() ? document.body.dataset.adminPage : 'login';
    }
    return session() ? 'overview' : 'login';
  }

  function storefrontHome() {
    if (typeof AppRoutes !== 'undefined') return new URL(AppRoutes.page('index'), window.location.origin).href;
    return new URL('/', window.location.origin).href;
  }

  function guard() {
    if (status === 'authenticated' && session()) return true;
    if (status === 'anonymous') {
      window.location.replace(adminPath('login'));
      return false;
    }
    const app = document.getElementById('admin-app');
    if (app && !app.querySelector('[data-admin-boot]')) {
      app.innerHTML = '<p data-admin-boot role="status" style="padding:2rem;font-family:Cairo,sans-serif;color:#64748b">جاري التحقق من الجلسة… / Checking session…</p>';
    }
    return false;
  }

  function showDashboard(page) {
    const app = document.getElementById('admin-app');
    document.body.dataset.adminPage = page;
    document.body?.classList?.remove('is-admin-login');
    if (app) { app.hidden = false; app.setAttribute('aria-busy', 'false'); }
    if (typeof window.renderAdminPage === 'function') {
      window.renderAdminPage();
      return;
    }
    if (app) {
      app.innerHTML = '<p role="alert" style="padding:2rem;font-family:Cairo,sans-serif;color:#ba1a1a">تعذّر تحميل سكربتات لوحة التحكم. تأكد أن ملفات /js/admin تصل عبر HTTPS. / Dashboard scripts failed to load.</p>';
    }
  }

  async function initialize(operation) {
    showStatus('loading');
    try {
      const data = await sessionRequest('/api/admin/session');
      if (operation !== revision) return;
      currentSession = normalizeSession(data);
      status = currentSession ? 'authenticated' : 'anonymous';
    } catch {
      if (operation === revision) showStatus('error');
      return;
    }

    if (!session()) {
      window.location.replace(adminPath('login'));
      return;
    }

    const page = pageFromLocation();
    if (page === 'login') {
      window.location.replace(adminPath('overview'));
      return;
    }

    const current = window.location.pathname.replace(/\/+$/, '') || '/';
    const target = adminPath(page === 'overview' ? 'overview' : page);
    if (current.startsWith('/dashboard') && current !== target.replace(/\/+$/, '')) {
      history.replaceState({}, '', target);
    }
    showDashboard(page);
  }

  function boot() {
    if (initialization && initialization.revision === revision) return initialization.promise;
    const operation = ++revision;
    const promise = initialize(operation).finally(() => {
      if (initialization?.revision === operation) initialization = null;
    });
    initialization = {revision:operation,promise};
    return promise;
  }

  return { session, login, logout, guard, storefrontHome, boot, adminPath, status: () => status };
})();

window.AdminAuth = AdminAuth;
document.addEventListener('DOMContentLoaded', () => AdminAuth.boot());
