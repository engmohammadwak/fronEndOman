function readSuccessOrder() {
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get('order_id');
  const last = typeof readSavedState === 'function' ? readSavedState('techpro_last_order', null) : null;
  if (last && (!urlId || last.orderId === urlId)) return last;
  const found = getOrders().find((item) => item.orderId === urlId);
  return found || null;
}

function renderSuccessPage() {
  const root = document.getElementById('commerce-root');
  if (!root) return;
  const order = readSuccessOrder();
  document.title = commerceText('success_page_title', commerceCopy('تم تأكيد طلبك', 'Order confirmed')) + ' | TechPro';

  if (!order) {
    root.innerHTML = `
      ${renderStepper(3)}
      <section class="commerce-card commerce-empty">
        <span class="material-symbols-outlined">receipt_long</span>
        <h1 class="text-2xl font-black mt-3">${escapeHtml(commerceCopy('لا يوجد طلب لعرضه', 'No order to display'))}</h1>
        <a class="commerce-btn commerce-btn-primary px-5 mt-5" href="${escapeHtml(getStorefrontPageUrl('catalog.html'))}">${escapeHtml(commerceCopy('تسوق الآن', 'Shop now'))}</a>
      </section>
    `;
    return;
  }

  root.innerHTML = `
    ${renderStepper(3)}
    <section class="commerce-card commerce-success">
      <div class="commerce-success-icon"><span class="material-symbols-outlined text-4xl">check</span></div>
      <h1 class="text-2xl font-black">${escapeHtml(order.isDemo ? commerceCopy('تم حفظ طلب تجريبي', 'Demo order saved') : commerceCopy('تم استلام الطلب', 'Order received'))}</h1>
      <p class="text-secondary max-w-lg mx-auto mt-2">${escapeHtml(order.isDemo ? commerceCopy('هذا طلب عرض على جهازك فقط، لم يُرسل للمتجر ولم تتم أي عملية دفع.', 'This preview is stored only on your device. No order was sent and no payment was made.') : commerceCopy('استلم المتجر الطلب. حالة الدفع تعتمد على تأكيد مزود الدفع.', 'The store received your order. Payment depends on confirmation by the payment provider.'))}</p>
      <div class="max-w-md mx-auto mt-5 p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
        <div class="text-start">
          <span class="text-xs text-secondary">${escapeHtml(commerceCopy('رقم الطلب المرجعي', 'Reference number'))}</span>
          <strong id="order-id-display" class="block font-mono text-lg">#${escapeHtml(order.orderId)}</strong>
        </div>
        <button type="button" class="commerce-btn commerce-btn-ghost px-3 text-xs" data-success-action="copy">${escapeHtml(commerceCopy('نسخ الرقم', 'Copy'))}</button>
      </div>
      <button type="button" class="commerce-btn commerce-btn-wa w-full max-w-md mt-4" data-success-action="whatsapp">
        <span class="material-symbols-outlined">chat</span>
        ${escapeHtml(commerceCopy('تتبع الطلب مباشرة مع الإدارة عبر واتساب', 'Track this order with admin on WhatsApp'))}
      </button>
      <div class="flex flex-wrap justify-center gap-2 mt-4">
        <a class="commerce-btn commerce-btn-primary px-5" href="../../index.html">${escapeHtml(commerceCopy('العودة للرئيسية', 'Back home'))}</a>
        <button type="button" class="commerce-btn commerce-btn-ghost px-5" data-success-action="invoice">${escapeHtml(commerceCopy('تحميل الفاتورة', 'Download invoice'))}</button>
      </div>
    </section>
    <section class="commerce-panel mt-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-black">${escapeHtml(commerceCopy('حالة التجهيز', 'Fulfillment status'))}</h2>
        <span class="commerce-chip commerce-chip-green">${escapeHtml(commerceCopy('قيد الفحص والتجهيز', 'Being prepared'))}</span>
      </div>
      <div class="commerce-track text-sm">
        <div><strong>${escapeHtml(commerceCopy('تم استلام الطلب', 'Order received'))}</strong><p class="text-xs text-secondary">${escapeHtml(commerceCopy('الدفع معتمد', 'Payment recorded'))}</p></div>
        <div><strong class="text-primary">${escapeHtml(commerceCopy('الفحص والتجهيز', 'Inspection'))}</strong><p class="text-xs text-secondary">${escapeHtml(commerceCopy('المرحلة الحالية', 'Current step'))}</p></div>
        <div class="opacity-60"><strong>${escapeHtml(commerceCopy('الشحن', 'Shipping'))}</strong><p class="text-xs text-secondary">${escapeHtml(commerceCopy('أسطول التوصيل', 'Delivery fleet'))}</p></div>
        <div class="opacity-60"><strong>${escapeHtml(commerceCopy('التسليم', 'Delivered'))}</strong><p class="text-xs text-secondary">${escapeHtml(commerceCopy('خلال 24-48 ساعة', 'Within 24-48 hours'))}</p></div>
      </div>
    </section>
  `;
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-success-action]');
  if (!trigger) return;
  const order = readSuccessOrder();
  if (!order) return;
  if (trigger.dataset.successAction === 'copy') {
    navigator.clipboard?.writeText(order.orderId).then(() => notifyCommerce(commerceCopy('تم نسخ رقم الطلب', 'Order number copied'), 'info'));
  }
  if (trigger.dataset.successAction === 'whatsapp') {
    const url = buildWhatsAppTrackUrl(order);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else notifyCommerce(commerceCopy('رقم الدعم غير مضبوط بعد.', 'Support number has not been configured.'), 'info');
  }
  if (trigger.dataset.successAction === 'invoice') {
    notifyCommerce(commerceCopy('تحميل الفاتورة غير متاح حتى ربط خدمة الفواتير.', 'Invoice downloads are unavailable until invoicing is connected.'), 'info');
  }
});

onStorefrontReady(renderSuccessPage);
window.addEventListener('languageChanged', renderSuccessPage);
