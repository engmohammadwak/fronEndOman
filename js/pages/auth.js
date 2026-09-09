function authMode() {
  return document.body.dataset.authPage === 'register' ? 'register' : 'login';
}

function nextAuthTarget() {
  const next = new URLSearchParams(window.location.search).get('next');
  if (next && /^[a-z0-9-]+\.html$/i.test(next)) {
    return getStorefrontPageUrl(next);
  }
  return getStorefrontPageUrl('account.html');
}

function renderAuthPage() {
  const root = document.getElementById('commerce-root');
  if (!root) return;
  if (!isDemoMode()) { root.textContent = commerceCopy('تسجيل الدخول الحقيقي غير متاح حتى ربط خدمة الحسابات.', 'Live sign-in is unavailable until authentication is connected.'); return; }

  const mode = authMode();
  const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
  document.title = (mode === 'register'
    ? commerceCopy('إنشاء حساب', 'Create account')
    : commerceCopy('تسجيل الدخول', 'Sign in')) + ' | TechPro';

  if (session) {
    window.location.href = nextAuthTarget();
    return;
  }

  root.innerHTML = `
    <section class="commerce-auth mt-4">
      <form id="auth-form" class="commerce-panel" novalidate>
        <p class="text-primary mb-4">${escapeHtml(commerceCopy('حساب عرض محلي فقط. استخدم بيانات تجريبية وكلمة مرور غير مستخدمة في حساباتك.', 'Local demo account only. Use fictional details and a password not used by your real accounts.'))}</p>
        <h1 class="text-2xl font-black mb-1">${escapeHtml(mode === 'register' ? commerceCopy('إنشاء حساب جديد', 'Create a new account') : commerceCopy('تسجيل الدخول', 'Sign in'))}</h1>
        <p class="text-secondary text-sm mb-5">${escapeHtml(mode === 'register'
          ? commerceCopy('لكل حساب عرض سلة ومفضلة منفصلتان عن سلة الزائر على هذا الجهاز.', 'Each preview account has a separate cart and wishlist from the guest on this device.')
          : commerceCopy('ادخل برقم الهاتف أو البريد. الحساب التجريبي جاهز للعرض.', 'Use your phone or email. A demo account is ready for preview.'))}</p>
        ${mode === 'register' ? `
          <div class="commerce-field mb-3">
            <label for="auth-name">${escapeHtml(commerceCopy('الاسم الكامل', 'Full name'))}</label>
            <input id="auth-name" required>
            <small class="is-error hidden" id="auth-err-name"></small>
          </div>
        ` : ''}
        <div class="commerce-field mb-3">
          <label for="auth-id">${escapeHtml(mode === 'register' ? commerceCopy('رقم الهاتف', 'Phone number') : commerceCopy('الهاتف أو البريد', 'Phone or email'))}</label>
          <input id="auth-id" required>
          <small class="is-error hidden" id="auth-err-id"></small>
        </div>
        ${mode === 'register' ? `
          <div class="commerce-field mb-3">
            <label for="auth-email">${escapeHtml(commerceCopy('البريد الإلكتروني (اختياري)', 'Email (optional)'))}</label>
            <input id="auth-email" type="email">
            <small class="is-error hidden" id="auth-err-email"></small>
          </div>
          <div class="commerce-field mb-3">
            <label for="auth-address">${escapeHtml(commerceCopy('عنوان التوصيل', 'Delivery address'))}</label>
            <input id="auth-address">
          </div>
        ` : ''}
        <div class="commerce-field mb-3">
          <label for="auth-password">${escapeHtml(commerceCopy('كلمة المرور', 'Password'))}</label>
          <input id="auth-password" type="password" required minlength="6">
          <small class="is-error hidden" id="auth-err-password"></small>
        </div>
        ${mode === 'register' ? `
          <div class="commerce-field mb-3">
            <label for="auth-confirm">${escapeHtml(commerceCopy('تأكيد كلمة المرور', 'Confirm password'))}</label>
            <input id="auth-confirm" type="password" required>
            <small class="is-error hidden" id="auth-err-confirm"></small>
          </div>
        ` : ''}
        <p class="is-error hidden mb-3" id="auth-err-form"></p>
        <button type="submit" class="commerce-btn commerce-btn-primary w-full">${escapeHtml(mode === 'register' ? commerceCopy('إنشاء الحساب', 'Create account') : commerceCopy('دخول', 'Sign in'))}</button>
        <p class="text-xs text-secondary mt-4">
          ${mode === 'register'
            ? `${escapeHtml(commerceCopy('لديك حساب؟', 'Already have an account?'))} <a class="text-primary font-bold" href="${escapeHtml(getStorefrontPageUrl('login.html'))}">${escapeHtml(commerceCopy('تسجيل الدخول', 'Sign in'))}</a>`
            : `${escapeHtml(commerceCopy('جديد هنا؟', 'New here?'))} <a class="text-primary font-bold" href="${escapeHtml(getStorefrontPageUrl('register.html'))}">${escapeHtml(commerceCopy('إنشاء حساب', 'Create account'))}</a>`}
        </p>
        ${mode === 'login' ? `<p class="text-[11px] text-secondary mt-3">${escapeHtml(commerceCopy('حساب العرض: 96891234567 / Demo@123', 'Demo login: 96891234567 / Demo@123'))}</p>` : ''}
      </form>
      <aside class="commerce-panel">
        <h2 class="font-black mb-2">${escapeHtml(commerceCopy('ماذا يتغير بعد الاشتراك؟', 'What changes after joining?'))}</h2>
        <ul class="text-sm text-secondary space-y-2">
          <li>${escapeHtml(commerceCopy('تعبئة الاسم والهاتف والعنوان تلقائياً عند الدفع', 'Name, phone, and address autofill at checkout'))}</li>
          <li>${escapeHtml(commerceCopy('شارة عميل مميز ونقاط ولاء', 'Member badge and loyalty points'))}</li>
          <li>${escapeHtml(commerceCopy('سجل طلبات مع تتبع واتساب للإدارة', 'Order history with WhatsApp tracking'))}</li>
          <li>${escapeHtml(commerceCopy('السلّة والمفضلة تبقى على جهازك حتى قبل التسجيل', 'Cart and wishlist stay on this device even before signup'))}</li>
        </ul>
      </aside>
    </section>
  `;
}

function setAuthError(id, message) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.textContent = message || '';
  el.classList.toggle('hidden', !message);
  return !message;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!isDemoMode()) return;
  await seedDemoAccount();

  const mode = authMode();
  const users = getAuthUsers();
  const identifier = document.getElementById('auth-id')?.value.trim() || '';
  const password = document.getElementById('auth-password')?.value || '';
  let ok = true;
  ok = setAuthError('auth-err-id', identifier ? '' : commerceCopy('أدخل الهاتف أو البريد', 'Enter phone or email')) && ok;
  ok = setAuthError('auth-err-password', password.length >= 6 ? '' : commerceCopy('كلمة المرور 6 أحرف على الأقل', 'Password must be at least 6 characters')) && ok;

  if (mode === 'register') {
    const name = document.getElementById('auth-name')?.value.trim() || '';
    const email = document.getElementById('auth-email')?.value.trim() || '';
    const confirm = document.getElementById('auth-confirm')?.value || '';
    const address = document.getElementById('auth-address')?.value.trim() || '';
    ok = setAuthError('auth-err-name', name.length >= 3 ? '' : commerceCopy('أدخل الاسم الكامل', 'Enter your full name')) && ok;
    ok = setAuthError('auth-err-email', !email || /.+@.+\..+/.test(email) ? '' : commerceCopy('بريد غير صحيح', 'Invalid email')) && ok;
    ok = setAuthError('auth-err-confirm', confirm === password ? '' : commerceCopy('كلمتا المرور غير متطابقتين', 'Passwords do not match')) && ok;
    if (!ok) return;
    if (users.some((user) => user.phone === identifier || (email && user.email === email))) {
      setAuthError('auth-err-form', commerceCopy('هذا الحساب مسجّل مسبقاً', 'This account already exists'));
      return;
    }
    const user = {
      id: Date.now(),
      name,
      nameEn: name,
      phone: identifier,
      email,
      address,
      password: await hashPassword(password),
      loyaltyPoints: 75
    };
    users.push(user);
    if (!saveState('techpro_demo_users_v2', users)) throw new Error('Storage unavailable');
    setAuthSession(user);
  } else {
    if (!ok) return;
    const user = users.find((item) => item.phone === identifier || item.email === identifier);
    if (!user || !await verifyDemoPassword(password, user.password)) {
      setAuthError('auth-err-form', commerceCopy('بيانات الدخول غير صحيحة', 'Invalid sign-in details'));
      return;
    }
    setAuthSession(user);
  }

  if (typeof updateAccountDisplay === 'function') updateAccountDisplay();
  notifyCommerce(commerceCopy('تم تسجيل الدخول بنجاح', 'Signed in successfully'));
  window.location.href = nextAuthTarget();
}

let authSubmitting = false;
document.addEventListener('submit', async (event) => {
  if (event.target.id !== 'auth-form') return;
  event.preventDefault();
  if (authSubmitting) return;
  authSubmitting = true;
  const button = event.target.querySelector('[type="submit"]');
  if (button) button.disabled = true;
  try { await handleAuthSubmit(event); }
  catch { setAuthError('auth-err-form', commerceCopy('تعذّر حفظ حساب العرض. تحقق من السماح بتخزين البيانات.', 'Could not save the demo account. Check browser storage permissions.')); }
  finally { authSubmitting = false; if (button) button.disabled = false; }
});

onStorefrontReady(renderAuthPage);
window.addEventListener('languageChanged', () => {
  const draft = Array.from(document.querySelectorAll('#auth-form input'), input => [input.id, input.value]);
  renderAuthPage();
  draft.forEach(([id, value]) => { const input = document.getElementById(id); if (input) input.value = value; });
});

window.addEventListener('commerceStateChanged', renderAuthPage);
