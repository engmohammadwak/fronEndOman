const AdminAuth = (() => {
  const SESSION_KEY = 'techpro_admin_session';
  const USER = 'admin';
  const previewEnabled = () => window.TECHPRO_CONFIG?.mode === 'demo';

  function session() {
    if (!previewEnabled()) return null;
    try {
      let raw = localStorage.getItem(SESSION_KEY);
      if (raw === null) {
        const legacy = sessionStorage.getItem(SESSION_KEY);
        if (legacy) { localStorage.setItem(SESSION_KEY, legacy); sessionStorage.removeItem(SESSION_KEY); raw = legacy; }
      }
      const data = raw ? JSON.parse(raw) : null;
      return data && data.ok === true && typeof data.user === 'string' ? data : null;
    } catch {
      return null;
    }
  }

  function login(username) {
    if (!previewEnabled() || !String(username || '').trim()) return false;
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      ok: true,
      user: USER,
      name: 'مدير النظام',
      nameEn: 'System admin',
      at: Date.now()
    }));
    return true;
  }

  function logout() {
    localStorage.setItem(SESSION_KEY, 'null');
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }

  function guard() {
    if (session()) return true;
    const loginUrl = new URL('login.html', window.location.href).href;
    window.location.replace(loginUrl);
    return false;
  }

  function storefrontHome() {
    return new URL('../../index.html', window.location.href).href;
  }

  function initLoginPage() {
    if (document.body.dataset.adminPage !== 'login') return;
    applyAdminDir();
    if (!previewEnabled()) { document.body.textContent = 'Live administration requires server authentication. الإدارة الفعلية تحتاج مصادقة الخادم.'; return; }
    if (session()) {
      window.location.replace(new URL('index.html', window.location.href).href);
      return;
    }
    const fill = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    fill('login-title', t('loginTitle'));
    fill('login-hint', t('loginHint'));
    fill('login-user-label', t('user'));
    fill('login-pass-label', t('pass'));
    fill('login-submit', t('enter'));
    fill('login-demo', t('demoHint'));
    fill('admin-lang', t('lang'));
    fill('login-meta-1', t('loginMeta1'));
    fill('login-meta-2', t('loginMeta2'));
    fill('login-meta-3', t('loginMeta3'));
    document.getElementById('admin-lang')?.addEventListener('click', () => {
      StoreState.setLang(adminLang() === 'ar' ? 'en' : 'ar');
      window.location.reload();
    });
    document.getElementById('admin-login-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const user = document.getElementById('admin-user')?.value;

      const error = document.getElementById('admin-login-error');
      let accepted = false;
      try { accepted = login(user); } catch {}
      if (accepted) {
        window.location.replace(new URL('index.html', window.location.href).href);
        return;
      }
      if (error) {
        error.hidden = false;
        error.textContent = t('badLogin');
      }
    });
  }

  return { session, login, logout, guard, storefrontHome, USER, initLoginPage };
})();

window.AdminAuth = AdminAuth;
document.addEventListener('DOMContentLoaded', () => AdminAuth.initLoginPage());
