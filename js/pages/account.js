function renderAccountPage() {
  const root = document.getElementById('commerce-root');
  if (!root) return;
  const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
  const totals = cartTotals();
  const saved = resolveWishlistProducts();
  const orders = getOrders().filter((order) => session && String(order.userId) === String(session.id));
  document.title = commerceText('account_page_title', commerceCopy('حسابي', 'My account')) + ' | TechPro';

  if (!session) {
    root.innerHTML = `
      <section class="commerce-auth mt-4">
        <div class="commerce-panel">
          <span class="commerce-chip commerce-chip-guest">${escapeHtml(commerceCopy('زائر', 'Guest'))}</span>
          <h1 class="text-2xl font-black mt-3">${escapeHtml(commerceCopy('سجّل دخولك لتجربة أوضح', 'Sign in for a fuller experience'))}</h1>
          <p class="text-secondary mt-2">${escapeHtml(commerceCopy('السلّة والمفضلة محفوظتان على جهازك الآن. بعد الاشتراك تظهر نقاط الولاء وسجل الطلبات وبيانات التوصيل تلقائياً.', 'Cart and wishlist are already saved on this device. After signing in you get loyalty points, order history, and autofill.'))}</p>
          <div class="flex flex-wrap gap-2 mt-5">
            <a class="commerce-btn commerce-btn-primary px-5" href="${escapeHtml(getStorefrontPageUrl('login.html'))}">${escapeHtml(commerceCopy('تسجيل الدخول', 'Sign in'))}</a>
            <a class="commerce-btn commerce-btn-ghost px-5" href="${escapeHtml(getStorefrontPageUrl('register.html'))}">${escapeHtml(commerceCopy('إنشاء حساب', 'Create account'))}</a>
          </div>
        </div>
        <div class="commerce-panel">
          <h2 class="font-black mb-3">${escapeHtml(commerceCopy('محفوظ على جهازك', 'Saved on this device'))}</h2>
          <p class="text-sm mb-2">${escapeHtml(commerceCopy('السلة', 'Cart'))}: <strong>${totals.count}</strong> • ${formatCommerceMoney(totals.total)}</p>
          <p class="text-sm">${escapeHtml(commerceCopy('المفضلة', 'Wishlist'))}: <strong>${saved.length}</strong></p>
          <div class="flex gap-2 mt-4">
            <a class="commerce-btn commerce-btn-green px-4 text-sm" href="${escapeHtml(getStorefrontPageUrl('cart.html'))}">${escapeHtml(commerceCopy('فتح السلة', 'Open cart'))}</a>
            <a class="commerce-btn commerce-btn-ghost px-4 text-sm" href="${escapeHtml(getStorefrontPageUrl('wishlist.html'))}">${escapeHtml(commerceCopy('فتح المفضلة', 'Open wishlist'))}</a>
          </div>
        </div>
      </section>
      ${orders.length ? `
      <section class="commerce-panel mt-4">
        <h2 class="font-black mb-3">${escapeHtml(commerceCopy('آخر طلب على هذا الجهاز', 'Latest order on this device'))}</h2>
        ${orders.slice(0, 3).map((order) => `
          <article class="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-outline-variant/10">
            <div>
              <strong class="font-mono">#${escapeHtml(order.orderId)}</strong>
              <p class="text-xs text-secondary">${escapeHtml(order.customerName || '')}</p>
            </div>
            <div class="flex items-center gap-2">
              <strong class="font-mono">${formatCommerceMoney(order.total)}</strong>
              <a class="commerce-btn commerce-btn-wa px-3 text-xs min-h-9" href="${escapeHtml(buildWhatsAppTrackUrl(order))}" target="_blank" rel="noopener noreferrer">${escapeHtml(commerceCopy('واتساب', 'WhatsApp'))}</a>
            </div>
          </article>
        `).join('')}
      </section>` : ''}
    `;
    return;
  }

  root.innerHTML = `
    <section class="commerce-auth mt-4">
      <div class="commerce-panel">
        <div class="flex items-center justify-between gap-3">
          <div>
            <span class="commerce-chip">${escapeHtml(commerceCopy('عميل مميز', 'Member'))}</span>
            <h1 class="text-2xl font-black mt-2">${escapeHtml(commerceCopy(session.name, session.nameEn || session.name))}</h1>
            <p class="text-secondary text-sm mt-1">${escapeHtml(session.phone)} ${session.email ? '• ' + escapeHtml(session.email) : ''}</p>
          </div>
          <button type="button" class="commerce-btn commerce-btn-ghost px-4 text-sm" data-account-action="logout">${escapeHtml(commerceCopy('تسجيل الخروج', 'Sign out'))}</button>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-5">
          <div class="p-3 rounded-xl bg-surface-container-low"><span class="text-xs text-secondary">${escapeHtml(commerceCopy('نقاط الولاء', 'Loyalty points'))}</span><strong class="block text-xl font-black text-primary">${session.loyaltyPoints || 0}</strong></div>
          <div class="p-3 rounded-xl bg-surface-container-low"><span class="text-xs text-secondary">${escapeHtml(commerceCopy('الطلبات', 'Orders'))}</span><strong class="block text-xl font-black">${orders.length}</strong></div>
        </div>
      </div>
      <div class="commerce-panel">
        <h2 class="font-black mb-3">${escapeHtml(commerceCopy('السلة والمفضلة', 'Cart & wishlist'))}</h2>
        <p class="text-sm mb-2">${escapeHtml(commerceCopy('السلة', 'Cart'))}: <strong>${totals.count}</strong> • ${formatCommerceMoney(totals.total)}</p>
        <p class="text-sm mb-4">${escapeHtml(commerceCopy('المفضلة', 'Wishlist'))}: <strong>${saved.length}</strong></p>
        <div class="flex flex-wrap gap-2">
          <a class="commerce-btn commerce-btn-primary px-4 text-sm" href="${escapeHtml(getStorefrontPageUrl('cart.html'))}">${escapeHtml(commerceCopy('إتمام الشراء', 'Checkout'))}</a>
          <a class="commerce-btn commerce-btn-ghost px-4 text-sm" href="${escapeHtml(getStorefrontPageUrl('wishlist.html'))}">${escapeHtml(commerceCopy('المفضلة', 'Wishlist'))}</a>
        </div>
      </div>
    </section>
    <section class="commerce-panel mt-4">
      <h2 class="font-black mb-3">${escapeHtml(commerceCopy('سجل الطلبات', 'Order history'))}</h2>
      ${orders.length ? orders.map((order) => `
        <article class="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-outline-variant/10">
          <div>
            <strong class="font-mono">#${escapeHtml(order.orderId)}</strong>
            <p class="text-xs text-secondary">${escapeHtml(order.address || '')}</p>
          </div>
          <div class="flex items-center gap-2">
            <strong class="font-mono">${formatCommerceMoney(order.total)}</strong>
            <a class="commerce-btn commerce-btn-wa px-3 text-xs min-h-9" href="${escapeHtml(buildWhatsAppTrackUrl(order))}" target="_blank" rel="noopener noreferrer">${escapeHtml(commerceCopy('واتساب', 'WhatsApp'))}</a>
          </div>
        </article>
      `).join('') : `<p class="text-secondary text-sm">${escapeHtml(commerceCopy('لا توجد طلبات بعد. ابدأ من السلة.', 'No orders yet. Start from the cart.'))}</p>`}
    </section>
  `;
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-account-action="logout"]')) {
    try { if (typeof clearAuthSession === 'function') clearAuthSession(); }
    catch { notifyCommerce(commerceCopy('تعذّر حفظ تسجيل الخروج. تحقق من السماح بتخزين الموقع.', 'Could not save sign-out. Check site storage permissions.'), 'error'); return; }
    if (typeof updateAccountDisplay === 'function') updateAccountDisplay();
    notifyCommerce(commerceCopy('تم تسجيل الخروج', 'Signed out'), 'info');
    renderAccountPage();
  }
});

onStorefrontReady(renderAccountPage);
window.addEventListener('languageChanged', renderAccountPage);

window.addEventListener('commerceStateChanged', renderAccountPage);
