function paymentOrderId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('order_id') || params.get('merchant_order_id') || readSavedState('techpro_pending_order', null)?.id || '';
}

function paintPaymentReturn(state, order) {
  const root = document.getElementById('commerce-root');
  if (!root) return;
  const copy = {
    checking: [commerceCopy('جاري تأكيد الدفع من Paymob', 'Confirming payment with Paymob'), commerceCopy('لا نعتمد رابط الرجوع وحده. ننتظر تأكيد الخادم.', 'The return URL is not enough. We wait for server confirmation.')],
    paid: [commerceCopy('تم استلام المبلغ', 'Payment received'), commerceCopy('أكدت بوابة الدفع العملية. الطلب يظهر الآن في لوحة التحكم.', 'The gateway confirmed the charge. The order is now in the dashboard.')],
    failed: [commerceCopy('لم يكتمل الدفع', 'Payment did not complete'), commerceCopy('السلة ما زالت محفوظة. يمكنك المحاولة مرة أخرى أو اختيار الدفع عند الاستلام.', 'Your cart is still saved. Retry or choose cash on delivery.')],
    missing: [commerceCopy('لا يوجد طلب للدفع', 'No payment order found'), commerceCopy('ارجع للسلة أو تتبع الطلب من حسابك.', 'Return to the cart or track the order from your account.')]
  };
  const [title, text] = copy[state] || copy.checking;
  const icon = state === 'paid' ? 'check' : (state === 'failed' ? 'error' : 'hourglass_top');
  root.innerHTML = `
    ${renderStepper(state === 'paid' ? 3 : 2)}
    <section class="commerce-card ${state === 'paid' ? 'commerce-success' : 'commerce-empty'}">
      <span class="material-symbols-outlined">${icon}</span>
      <h1 class="text-2xl font-black mt-3">${escapeHtml(title)}</h1>
      <p class="text-secondary max-w-lg mx-auto mt-2">${escapeHtml(text)}</p>
      ${order?.orderId ? `<strong class="block font-mono mt-4">#${escapeHtml(order.orderId)}</strong>` : ''}
      <div class="flex flex-wrap justify-center gap-2 mt-5">
        <a class="commerce-btn commerce-btn-primary px-5" href="${escapeHtml(getStorefrontPageUrl(state === 'paid' ? 'success.html' : 'checkout.html'))}${state === 'paid' && order?.orderId ? `?order_id=${encodeURIComponent(order.orderId)}` : ''}">${escapeHtml(state === 'paid' ? commerceCopy('عرض الطلب', 'View order') : commerceCopy('العودة للدفع', 'Back to checkout'))}</a>
      </div>
    </section>
  `;
}

function fulfillPaidOrder(order) {
  if (!order || order.paymentStatus !== 'paid') return order;
  if (typeof StoreState !== 'undefined' && !order.inventoryDeducted) {
    StoreState.deductCart(order.items || []);
    order = { ...order, inventoryDeducted: true };
  }
  saveOrderLocally(order);
  clearCart();
  saveState('techpro_promo', null);
  saveState('techpro_pending_order', null);
  saveState('techpro_last_order', order);
  return order;
}

async function pollPaidOrder(orderId, attempt = 0) {
  try {
    const data = await requestBackend(`orders/${encodeURIComponent(orderId)}`);
    const order = data.order || data;
    if (order.paymentStatus === 'paid') return fulfillPaidOrder(order);
    if (order.paymentStatus === 'failed' || order.status === 'cancelled') return { ...order, paymentStatus: 'failed' };
  } catch {}
  if (attempt >= 15) return { orderId, paymentStatus: 'pending' };
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return pollPaidOrder(orderId, attempt + 1);
}

async function renderPaymentReturnPage() {
  const orderId = paymentOrderId();
  document.title = commerceCopy('تأكيد الدفع', 'Payment confirmation') + ' | TechPro';
  if (!orderId) {
    paintPaymentReturn('missing');
    return;
  }
  paintPaymentReturn('checking', { orderId });
  const order = await pollPaidOrder(orderId);
  if (order.paymentStatus === 'paid') {
    paintPaymentReturn('paid', order);
    window.location.replace(`${getStorefrontPageUrl('success.html')}?order_id=${encodeURIComponent(order.orderId)}`);
    return;
  }
  paintPaymentReturn(order.paymentStatus === 'failed' ? 'failed' : 'checking', order);
}

onStorefrontReady(renderPaymentReturnPage);
window.addEventListener('languageChanged', renderPaymentReturnPage);
