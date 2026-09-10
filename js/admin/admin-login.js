function togglePasswordVisibility() {
  const pwdInput = document.getElementById('admin-password');
  const icon = document.getElementById('pwd-icon');
  if (!pwdInput || !icon) return;

  const isPassword = pwdInput.type === 'password';
  pwdInput.type = isPassword ? 'text' : 'password';
  icon.textContent = isPassword ? 'visibility_off' : 'visibility';
}

async function handleLoginSubmit() {
  const btn = document.getElementById('login-submit-btn');
  if (!btn || btn.disabled) return;

  const originalHtml = btn.innerHTML;
  const email = document.getElementById('admin-email')?.value.trim() || '';
  const password = document.getElementById('admin-password')?.value || '';
  const remember = document.getElementById('remember-session')?.checked === true;

  const errorBox = document.getElementById('login-error');
  errorBox.hidden = true;
  btn.disabled = true;
  btn.innerHTML = `
    <span class="material-symbols-outlined spinner">progress_activity</span>
    <span>جاري التحقق والمصادقة...</span>
  `;

  let accepted = false;
  try {
    const response = await fetch('/api/admin/login', {
      signal: AbortSignal.timeout(15000),
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password })
    });
    accepted = response.ok;
    if (!accepted) {
      const message = response.status === 401 ? 'بيانات الدخول غير صحيحة'
        : response.status === 429 ? 'محاولات كثيرة. حاول مجددًا بعد قليل.'
        : response.status === 503 ? 'حساب الإدارة غير مهيأ. شغّل npm run setup:admin على السيرفر.'
        : 'تعذّر إتمام الدخول. حاول مجددًا.';
      throw new Error(message);
    }
    try {
      if (remember) localStorage.setItem('techpro_admin_remember', JSON.stringify({ email }));
      else localStorage.removeItem('techpro_admin_remember');
    } catch {}
  } catch (error) {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    btn.classList.remove('btn-success');
    errorBox.textContent = error instanceof TypeError || error.name === 'TimeoutError' ? 'تعذّر الاتصال بالسيرفر. تحقق من الاتصال وحاول مجددًا.' : error.message;
    errorBox.hidden = false;
    return;
  }

  btn.classList.add('btn-success');
  btn.innerHTML = `
    <span class="material-symbols-outlined">verified_user</span>
    <span>تمت المصادقة - جاري التحويل...</span>
  `;

  setTimeout(() => {
    window.location.href = '/dashboard/home';
  }, 900);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('admin-login-form')?.addEventListener('submit', event => {event.preventDefault();handleLoginSubmit();});
  document.getElementById('toggle-pwd-btn')?.addEventListener('click',togglePasswordVisibility);
try {
  const remembered = JSON.parse(localStorage.getItem('techpro_admin_remember') || 'null');
  if (remembered?.email) {
    const email = document.getElementById('admin-email');
    const remember = document.getElementById('remember-session');
    if (email) email.value = remembered.email;
    if (remember) remember.checked = true;
  }
} catch {}

fetch('/api/admin/session', { credentials: 'same-origin', cache: 'no-store' })
  .then((response) => response.json().catch(() => null))
  .then((data) => { if (data?.ok === true) window.location.replace('/dashboard/home'); })
  .catch(() => {});

});
