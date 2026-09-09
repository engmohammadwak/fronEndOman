function renderCartPage() {
  const root = document.getElementById('commerce-root');
  if (!root) return;
  let stockChanged = false;
  const items = typeof cart !== 'undefined' ? cart.map((item) => {
    if (typeof StoreState === 'undefined' || item.productId == null) return item;
    item.stock = StoreState.availableStock(item.productId);
    if (item.stock > 0 && Number(item.qty || 1) > Number(item.stock)) {
      item.qty = Number(item.stock);
      stockChanged = true;
    }
    return item;
  }) : [];
  if (stockChanged && typeof persistCart === 'function') persistCart();
  const totals = cartTotals(items);
  document.title = commerceText('cart_page_title', commerceCopy('سلة المشتريات', 'Shopping cart')) + ' | TechPro';

  if (!items.length) {
    root.innerHTML = `
      ${renderStepper(1)}
      <section class="commerce-card commerce-empty">
        <span class="material-symbols-outlined">remove_shopping_cart</span>
        <h1 class="text-2xl font-black mt-3">${escapeHtml(commerceText('cart_empty_title', commerceCopy('سلة المشتريات فارغة حالياً', 'Your cart is empty')))}</h1>
        <p class="text-secondary mt-2 max-w-md mx-auto">${escapeHtml(commerceText('cart_empty_desc', commerceCopy('أضف أجهزة من الكتالوج أو المفضلة، والمحتوى يبقى محفوظاً على جهازك.', 'Add devices from the catalog or wishlist. Your items stay saved on this device.')))}</p>
        <div class="flex flex-wrap justify-center gap-2 mt-5">
          <a class="commerce-btn commerce-btn-primary px-5" href="${escapeHtml(getStorefrontPageUrl('catalog.html'))}">${escapeHtml(commerceCopy('الذهاب للكتالوج', 'Browse catalog'))}</a>
          <a class="commerce-btn commerce-btn-ghost px-5" href="${escapeHtml(getStorefrontPageUrl('wishlist.html'))}">${escapeHtml(commerceCopy('عرض المفضلة', 'View wishlist'))}</a>
        </div>
      </section>
    `;
    return;
  }

  root.innerHTML = `
    ${renderStepper(1)}
    <div class="commerce-grid">
      <div class="flex flex-col gap-3">
        <div class="commerce-card flex items-center gap-3 bg-emerald-50 border-emerald-200">
          <span class="material-symbols-outlined text-tertiary">electric_bolt</span>
          <div>
            <strong>${escapeHtml(commerceCopy('طلبك مؤهل للشحن السريع المجاني', 'Your order qualifies for free express shipping'))}</strong>
            <p class="text-xs text-secondary">${escapeHtml(commerceCopy('التوصيل خلال 24-48 ساعة مع شهادة الفحص.', 'Delivery within 24-48 hours with inspection certificate.'))}</p>
          </div>
        </div>
        <div class="commerce-card flex items-center justify-between">
          <h1 class="font-black">${escapeHtml(commerceCopy('المنتجات في السلة', 'Items in cart'))} (${items.length})</h1>
          <button type="button" class="text-xs font-bold text-secondary hover:text-error" data-cart-action="clear">${escapeHtml(commerceCopy('تفريغ السلة', 'Clear cart'))}</button>
        </div>
        ${items.map((item, index) => `
          <article class="commerce-card commerce-item">
            <img alt="${escapeHtml(itemDisplayName(item))}" src="${escapeHtml(typeof safeMediaUrl === 'function' ? safeMediaUrl(item.image, STOREFRONT_PLACEHOLDER_IMAGE) : (item.image || STOREFRONT_PLACEHOLDER_IMAGE))}">
            <div>
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="font-black text-sm">${escapeHtml(itemDisplayName(item))}</h2>
                  <div class="flex flex-wrap gap-1.5 mt-1">
                    ${item.conditionAr || item.conditionEn ? `<span class="commerce-chip">${escapeHtml(commerceCopy(item.conditionAr, item.conditionEn))}</span>` : ''}
                    ${item.extraAr || item.extraEn ? `<span class="commerce-chip commerce-chip-green">${escapeHtml(commerceCopy(item.extraAr, item.extraEn))}</span>` : ''}
                    ${item.storage ? `<span class="commerce-chip">${escapeHtml(item.storage)}</span>` : ''}
                  </div>
                </div>
                <div class="text-end font-mono">
                  <strong class="text-primary">${formatCommerceMoney(item.price)}</strong>
                  ${item.oldPrice ? `<div class="text-xs text-secondary line-through">${formatCommerceMoney(item.oldPrice)}</div>` : ''}
                </div>
              </div>
              ${item.stock != null ? `<p class="text-[11px] mt-2 ${Number(item.stock) <= 0 ? 'text-error' : 'text-secondary'}">${Number(item.stock) <= 0 ? escapeHtml(commerceCopy('نفد من المخزن', 'Out of stock')) : escapeHtml(commerceCopy(`المتبقي في المخزن: ${item.stock}`, `${item.stock} left in warehouse`))}</p>` : ''}
              <div class="flex items-center justify-between mt-3">
                <div class="commerce-qty">
                  <button type="button" data-cart-action="qty" data-index="${index}" data-delta="-1">-</button>
                  <span class="w-6 text-center text-xs font-bold">${escapeHtml(item.qty || 1)}</span>
                  <button type="button" data-cart-action="qty" data-index="${index}" data-delta="1" ${item.stock != null && Number(item.qty || 1) >= Number(item.stock) ? 'disabled' : ''}>+</button>
                </div>
                <button type="button" class="text-xs font-bold text-secondary hover:text-error" data-cart-action="remove" data-index="${index}">${escapeHtml(commerceCopy('إزالة', 'Remove'))}</button>
              </div>
              ${item.addonNameAr || item.addonNameEn ? `
                <label class="flex items-center justify-between gap-3 mt-3 p-2.5 rounded-xl bg-surface-container-low text-xs">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" data-cart-action="addon" data-index="${index}" ${item.addonActive ? 'checked' : ''}>
                    ${escapeHtml(commerceCopy(item.addonNameAr, item.addonNameEn))}
                  </span>
                  <strong class="text-primary font-mono">+${formatCommerceMoney(item.addonPrice || 0)}</strong>
                </label>
              ` : ''}
            </div>
          </article>
        `).join('')}
      </div>
      <aside class="commerce-aside">
        <div class="commerce-panel">
          <h2 class="font-black mb-3 pb-2 border-b border-outline-variant/15">${escapeHtml(commerceCopy('ملخص الحساب', 'Order summary'))}</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>${escapeHtml(commerceCopy('المجموع الفرعي', 'Subtotal'))}</span><strong class="font-mono">${formatCommerceMoney(totals.subtotal)}</strong></div>
            ${totals.savings ? `<div class="flex justify-between text-tertiary"><span>${escapeHtml(commerceCopy('توفير الأجهزة', 'Device savings'))}</span><strong>-${formatCommerceMoney(totals.savings)}</strong></div>` : ''}
            <div class="flex justify-between"><span>${escapeHtml(commerceCopy('الشحن', 'Shipping'))}</span><strong class="text-tertiary">${escapeHtml(commerceCopy('مجاناً', 'Free'))}</strong></div>
            ${totals.addons ? `<div class="flex justify-between"><span>${escapeHtml(commerceCopy('خدمات إضافية', 'Add-ons'))}</span><strong class="font-mono">${formatCommerceMoney(totals.addons)}</strong></div>` : ''}
            ${totals.promo ? `<div class="flex justify-between text-tertiary"><span>TECH2026</span><strong>-${formatCommerceMoney(totals.promo)}</strong></div>` : ''}
          </div>
          <div class="flex gap-2 mt-4">
            <input id="promo-input" class="flex-1 rounded-xl border border-outline-variant/30 px-3 text-xs font-mono uppercase bg-surface-container-low" placeholder="TECH2026">
            <button type="button" class="commerce-btn commerce-btn-ghost px-3 text-xs" data-cart-action="promo">${escapeHtml(commerceCopy('تطبيق', 'Apply'))}</button>
          </div>
          <div class="flex items-baseline justify-between mt-4 pt-3 border-t border-outline-variant/15">
            <span class="font-black">${escapeHtml(commerceCopy('الإجمالي المستحق', 'Amount due'))}</span>
            <strong class="text-2xl font-black text-primary font-mono">${formatCommerceMoney(totals.total)}</strong>
          </div>
          ${items.some((item) => item.stock != null && Number(item.stock) <= 0)
            ? `<p class="text-xs text-error mt-3">${escapeHtml(commerceCopy('أحد المنتجات نفد من المخزن. أزله لإتمام الطلب.', 'An item is out of stock. Remove it to continue.'))}</p>`
            : `<a class="commerce-btn commerce-btn-primary w-full mt-4" href="${escapeHtml(getStorefrontPageUrl('checkout.html'))}">${escapeHtml(commerceCopy('متابعة إتمام الطلب', 'Continue to checkout'))}</a>`}
        </div>
      </aside>
    </div>
  `;
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-cart-action]');
  if (!trigger || typeof cart === 'undefined') return;
  const action = trigger.dataset.cartAction;
  const index = Number(trigger.dataset.index);

  if (action === 'qty') {
    const item = cart[index];
    if (!item) return;
    const qty = Math.max(1, Number(item.qty || 1) + Number(trigger.dataset.delta));
    if (!validCartQuantity(qty) || (item.stock != null && qty > Number(item.stock))) return;
    item.qty = qty;
  }
  if (action === 'remove') {
    cart.splice(index, 1);
    notifyCommerce(commerceCopy('تمت إزالة المنتج من السلة', 'Item removed from cart'), 'info');
  }
  if (action === 'addon') {
    if (cart[index]) cart[index].addonActive = trigger.checked;
  }
  if (action === 'clear') {
    cart.splice(0, cart.length);
    notifyCommerce(commerceCopy('تم تفريغ السلة', 'Cart cleared'), 'info');
  }
  if (action === 'promo') {
    const ok = setPromoCode(document.getElementById('promo-input')?.value);
    notifyCommerce(ok ? commerceCopy('تم تطبيق خصم الكوبون', 'Promo applied') : commerceCopy('رمز الكوبون غير صحيح', 'Invalid promo code'), ok ? 'success' : 'error');
  }
  persistCart();
  renderCartPage();
});

onStorefrontReady(renderCartPage);
window.addEventListener('languageChanged', renderCartPage);

window.addEventListener('commerceStateChanged', renderCartPage);
