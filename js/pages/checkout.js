let checkoutSubmitting = false;
let checkoutOrderId = null;
const checkoutUi = {
  payment: 'card',
  name: null,
  phone: null,
  address: null
};

function captureCheckoutDraft() {
  checkoutUi.name = document.getElementById('cust-name')?.value ?? checkoutUi.name;
  checkoutUi.phone = document.getElementById('cust-phone')?.value ?? checkoutUi.phone;
  checkoutUi.address = document.getElementById('cust-address')?.value ?? checkoutUi.address;
}

function renderCheckoutPage() {
  const root = document.getElementById('commerce-root');
  if (!root) return;
  if (typeof cart === 'undefined' || !cart.length) {
    root.innerHTML = `
      ${renderStepper(2)}
      <section class="commerce-card commerce-empty">
        <span class="material-symbols-outlined">shopping_bag</span>
        <h1 class="text-2xl font-black mt-3">${escapeHtml(commerceCopy('لا يمكن إتمام الطلب بسلة فارغة', 'Checkout needs items in the cart'))}</h1>
        <a class="commerce-btn commerce-btn-primary px-5 mt-5" href="${escapeHtml(getStorefrontPageUrl('cart.html'))}">${escapeHtml(commerceCopy('العودة للسلة', 'Back to cart'))}</a>
      </section>
    `;
    return;
  }

  const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
  const totals = cartTotals();
  const nameValue = checkoutUi.name ?? session?.name ?? '';
  const phoneValue = checkoutUi.phone ?? session?.phone ?? '';
  const addressValue = checkoutUi.address ?? session?.address ?? '';
  document.title = commerceText('checkout_page_title', commerceCopy('الشحن والدفع', 'Checkout')) + ' | TechPro';

  root.innerHTML = `
    ${renderStepper(2)}
    ${isDemoMode() ? `<p class="commerce-panel mb-4 text-primary">${escapeHtml(commerceCopy('تجربة شراء فقط: لا تُدخل بيانات حقيقية. لن يتم إرسال طلب أو تحصيل مبلغ.', 'Preview checkout: use fictional details. No order will be sent and no payment will be collected.'))}</p>` : ''}
    <form id="checkout-form" class="commerce-grid">
      <div class="flex flex-col gap-4">
        <section class="commerce-panel">
          <div class="flex items-center justify-between mb-4">
            <h1 class="font-black flex items-center gap-2"><span class="material-symbols-outlined text-primary">person_pin</span>${escapeHtml(commerceCopy('بيانات العميل والتوصيل', 'Customer & delivery'))}</h1>
            <span class="${session ? 'commerce-chip' : 'commerce-chip commerce-chip-guest'}">${session ? escapeHtml(commerceCopy('عميل مسجل', 'Member')) : escapeHtml(commerceCopy('زائر', 'Guest'))}</span>
          </div>
          ${session ? `<p class="text-xs text-tertiary font-bold mb-3">${escapeHtml(commerceCopy(`مرحباً ${session.name} • ${session.loyaltyPoints} نقطة ولاء`, `Welcome ${session.nameEn || session.name} • ${session.loyaltyPoints} loyalty points`))}</p>` : `<p class="text-xs text-secondary mb-3">${escapeHtml(commerceCopy('يمكنك إتمام الطلب كزائر، أو ', 'You can checkout as a guest, or '))}<a class="text-primary font-bold" href="${escapeHtml(getStorefrontPageUrl('login.html'))}?next=checkout.html">${escapeHtml(commerceCopy('تسجيل الدخول', 'sign in'))}</a></p>`}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="commerce-field">
              <label for="cust-name">${escapeHtml(commerceCopy('الاسم الكامل', 'Full name'))}</label>
              <input id="cust-name" required value="${escapeHtml(nameValue)}">
              <small class="is-error hidden" id="err-name"></small>
            </div>
            <div class="commerce-field">
              <label for="cust-phone">${escapeHtml(commerceCopy('رقم الهاتف (واتساب التتبع)', 'Phone (WhatsApp tracking)'))}</label>
              <input id="cust-phone" required inputmode="tel" value="${escapeHtml(phoneValue)}">
              <small class="is-error hidden" id="err-phone"></small>
            </div>
            <div class="commerce-field md:col-span-2">
              <label for="cust-address">${escapeHtml(commerceCopy('عنوان التوصيل', 'Delivery address'))}</label>
              <input id="cust-address" required value="${escapeHtml(addressValue)}">
              <small class="is-error hidden" id="err-address"></small>
            </div>
          </div>
        </section>
        <section class="commerce-panel">
          <h2 class="font-black mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-primary">credit_card</span>${escapeHtml(commerceCopy('طريقة الدفع', 'Payment method'))}</h2>
          ${[['card', commerceCopy('البطاقات البنكية / Visa / Master', 'Bank cards / Visa / Master'), commerceCopy('دفع إلكتروني آمن', 'Secure card payment')],
            ['split', commerceCopy('تقسيط تابي أو تمارا (4 دفعات)', 'Tabby or Tamara (4 payments)'), commerceCopy('بدون فوائد', '0% interest')],
            ['cod', commerceCopy('الدفع عند الاستلام مع المعاينة', 'Cash on delivery with inspection'), commerceCopy('افحص الجهاز قبل الدفع', 'Inspect before paying')]].map(([value, title, desc]) => `
            <label class="commerce-pay ${checkoutUi.payment === value ? 'is-active' : ''} mb-2">
              <input type="radio" name="payment" value="${value}" ${checkoutUi.payment === value ? 'checked' : ''}>
              <span>
                <strong class="block">${escapeHtml(title)}</strong>
                <span class="text-xs text-secondary">${escapeHtml(desc)}</span>
              </span>
            </label>
          `).join('')}
        </section>
      </div>
      <aside class="commerce-aside">
        <div class="commerce-panel">
          <h2 class="font-black mb-3">${escapeHtml(commerceCopy('ملخص الفاتورة', 'Invoice summary'))}</h2>
          <div class="space-y-2 text-sm mb-4">
            ${cart.map((item) => `<div class="flex justify-between gap-3"><span class="line-clamp-1">${escapeHtml(itemDisplayName(item))} × ${item.qty || 1}</span><strong class="font-mono">${formatCommerceMoney(cartLineTotal(item))}</strong></div>`).join('')}
            ${totals.promo ? `<div class="flex justify-between text-tertiary"><span>TECH2026</span><strong>-${formatCommerceMoney(totals.promo)}</strong></div>` : ''}
            <div class="flex justify-between"><span>${escapeHtml(commerceCopy('الشحن', 'Shipping'))}</span><strong class="text-tertiary">${escapeHtml(commerceCopy('مجاناً', 'Free'))}</strong></div>
          </div>
          <div class="flex items-baseline justify-between border-t border-outline-variant/15 pt-3">
            <span class="font-black">${escapeHtml(commerceCopy('الإجمالي', 'Total'))}</span>
            <strong class="text-2xl font-black text-primary font-mono">${formatCommerceMoney(totals.total)}</strong>
          </div>
          <button type="submit" class="commerce-btn commerce-btn-primary w-full mt-4">${escapeHtml(commerceCopy('تأكيد الطلب والدفع', 'Place order'))}</button>
        </div>
      </aside>
    </form>
  `;
}

function validPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function showFieldError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('hidden', !message);
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (!cart.length || checkoutSubmitting) return;
  const name = document.getElementById('cust-name')?.value.trim() || '';
  const phone = document.getElementById('cust-phone')?.value.trim() || '';
  const address = document.getElementById('cust-address')?.value.trim() || '';
  let valid = true;
  showFieldError('err-name', name.length < 3 ? commerceCopy('أدخل الاسم الكامل', 'Enter the full name') : '');
  showFieldError('err-phone', validPhone(phone) ? '' : commerceCopy('أدخل رقم هاتف صحيح', 'Enter a valid phone number'));
  showFieldError('err-address', address.length < 8 ? commerceCopy('أدخل عنوان التوصيل', 'Enter a delivery address') : '');
  if (name.length < 3 || !validPhone(phone) || address.length < 8) valid = false;
  if (!valid) {
    notifyCommerce(commerceCopy('أكمل بيانات التوصيل قبل التأكيد', 'Complete delivery details first'), 'error');
    return;
  }

  if (!isDemoMode() && checkoutUi.payment !== 'cod') {
    notifyCommerce(commerceCopy('الدفع الإلكتروني غير مربوط بعد. اختر الدفع عند الاستلام.', 'Online payment is not connected. Select cash on delivery.'), 'error');
    return;
  }
  const totals = cartTotals();
  const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
  const fingerprint = JSON.stringify({ items: cart, name, phone, address, payment: checkoutUi.payment });
  const pending = readSavedState('techpro_pending_order', null);
  checkoutOrderId = pending?.fingerprint === fingerprint ? pending.id : createOrderId();
  saveState('techpro_pending_order', { id: checkoutOrderId, fingerprint });
  const order = {
    orderId: checkoutOrderId || (checkoutOrderId = createOrderId()),
    customerName: name,
    phone,
    address,
    email: session ? session.email : '',
    payment: checkoutUi.payment,
    items: cart.map((item) => ({ ...item })),
    ...totals,
    status: 'processing',
    createdAt: new Date().toISOString(),
    userId: session ? session.id : null
  };

  const ownerKeys = Object.fromEntries(['cart', 'techpro_promo', 'techpro_pending_order'].map(key => [key, stateStorageKey(key)]));
  checkoutSubmitting = true;
  const button = event.target.querySelector('[type="submit"]');
  if (button) button.disabled = true;
  try {
    if (isDemoMode() && typeof StoreState !== 'undefined') {
      const blocked = cart.find((item) => item.productId != null && !StoreState.canSell(item.productId, item.qty || 1));
      if (blocked) {
        notifyCommerce(commerceCopy('الكمية المطلوبة أكبر من المتوفر في المخزن.', 'Requested quantity exceeds warehouse stock.'), 'error');
        return;
      }
    }
    const saved = await submitOrderToDashboard(order);

    if (ownerKeys.cart !== stateStorageKey('cart')) {
      localStorage.setItem(ownerKeys.cart, '[]');
      localStorage.setItem(ownerKeys.techpro_promo, 'null');
      localStorage.setItem(ownerKeys.techpro_pending_order, 'null');
      return;
    }
    clearCart();
    saveState('techpro_promo', null);
    saveState('techpro_pending_order', null);
    window.location.href = `${getStorefrontPageUrl('success.html')}?order_id=${encodeURIComponent(saved.orderId)}`;
  } catch (error) {
    notifyCommerce(commerceCopy('لم يتم تأكيد الطلب. السلة محفوظة؛ حاول مجددًا.', 'Order was not confirmed. Your cart is preserved; please retry.'), 'error');
  } finally {
    checkoutSubmitting = false;
    if (button) button.disabled = false;
  }
}

document.addEventListener('change', (event) => {
  if (event.target.name !== 'payment') return;
  checkoutUi.payment = event.target.value;
  document.querySelectorAll('.commerce-pay').forEach((label) => {
    label.classList.toggle('is-active', label.querySelector('input')?.value === checkoutUi.payment);
  });
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'checkout-form') handleCheckoutSubmit(event);
});

document.addEventListener('input', (event) => {
  if (['cust-name', 'cust-phone', 'cust-address'].includes(event.target.id)) captureCheckoutDraft();
});

onStorefrontReady(renderCheckoutPage);
window.addEventListener('languageChanged', () => {
  captureCheckoutDraft();
  renderCheckoutPage();
});

window.addEventListener('commerceStateChanged', event => {
  if (event.detail?.sessionChanged) {
    checkoutUi.name = null;
    checkoutUi.phone = null;
    checkoutUi.address = null;
    checkoutOrderId = null;
  } else captureCheckoutDraft();
  renderCheckoutPage();
});
