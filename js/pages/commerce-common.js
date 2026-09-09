const ADMIN_WHATSAPP = window.TECHPRO_CONFIG?.adminWhatsApp || '';
const PROMO_CODE = 'TECH2026';
const PROMO_VALUE = 100;

function commerceCopy(ar, en) {
  return (typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : document.documentElement.lang) === 'en' ? en : ar;
}

function commerceText(key, fallback) {
  return typeof storefrontText === 'function' ? storefrontText(key, fallback) : fallback;
}

function commerceCurrency() {
  return commerceCopy('ر.ع.', 'OMR');
}

function formatCommerceMoney(amount) {
  return `${Number(amount || 0).toLocaleString()} ${commerceCurrency()}`;
}

function getPromoDiscount() {
  const promo = typeof readSavedState === 'function' ? readSavedState('techpro_promo', null) : null;
  if (promo && Number(promo.amount) > 0) return Number(promo.amount);
  return promo && promo.code === PROMO_CODE ? PROMO_VALUE : 0;
}

function setPromoCode(code) {
  if (typeof saveState !== 'function') return false;
  const typed = String(code || '').trim().toUpperCase();
  if (!typed) return false;
  if (typeof StoreState !== 'undefined') {
    const coupon = StoreState.findCoupon(typed);
    const subtotal = (typeof cart !== 'undefined' ? cart : []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
    const amount = coupon ? StoreState.couponValue(coupon, subtotal) : 0;
    if (coupon && amount > 0) {
      saveState('techpro_promo', { code: coupon.code, amount });
      return true;
    }
    return false;
  }
  if (typed === PROMO_CODE) {
    saveState('techpro_promo', { code: PROMO_CODE, amount: PROMO_VALUE });
    return true;
  }
  return false;
}

function cartTotals(list) {
  const items = list || (typeof cart !== 'undefined' ? cart : []);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
  const addons = items.reduce((sum, item) => sum + (item.addonActive ? Number(item.addonPrice || 0) : 0), 0);
  const savings = items.reduce((sum, item) => {
    const old = Number(item.oldPrice || 0);
    const price = Number(item.price || 0);
    return sum + (old > price ? (old - price) * Number(item.qty || 1) : 0);
  }, 0);
  const promo = getPromoDiscount();
  const total = Math.max(0, subtotal + addons - promo);
  return { subtotal, addons, savings, promo, total, count: items.reduce((sum, item) => sum + Number(item.qty || 1), 0) };
}

function persistCart() {
  if (typeof saveState === 'function' && typeof cart !== 'undefined') {
    saveState('cart', cart);
    if (typeof updateCartDisplay === 'function') updateCartDisplay();
  }
}

function itemDisplayName(item) {
  return commerceCopy(item.nameAr || item.title || item.name, item.nameEn || item.nameAr || item.title || item.name)
    || commerceCopy('منتج في السلة', 'Cart item');
}

function renderStepper(active) {
  const steps = [
    ['cart.html', commerceText('cart_step_cart', commerceCopy('سلة المشتريات', 'Cart')), 1],
    ['checkout.html', commerceText('cart_step_checkout', commerceCopy('الشحن والدفع', 'Checkout')), 2],
    ['success.html', commerceText('cart_step_done', commerceCopy('تأكيد الطلب', 'Confirmation')), 3]
  ];
  return `
    <nav class="commerce-stepper" aria-label="${escapeHtml(commerceCopy('مسار الطلب', 'Order steps'))}">
      ${steps.map(([href, label, index], i) => {
        const state = index < active ? 'is-done' : (index === active ? 'is-active' : '');
        const inner = `<i>${index < active ? '✓' : index}</i><span>${escapeHtml(label)}</span>`;
        const node = index < active
          ? `<a class="commerce-step ${state}" href="${escapeHtml(typeof getStorefrontPageUrl === 'function' ? getStorefrontPageUrl(href) : href)}">${inner}</a>`
          : `<span class="commerce-step ${state}">${inner}</span>`;
        return node + (i < steps.length - 1 ? '<span class="commerce-step-line" aria-hidden="true"></span>' : '');
      }).join('')}
    </nav>
  `;
}

function createOrderId() {
  return `TP-${crypto.randomUUID()}`;
}

function getOrders() {
  const orders = typeof readSavedState === 'function' ? readSavedState('techpro_orders', []) : [];
  return Array.isArray(orders) ? orders.filter(order => order && typeof order.orderId === 'string' && Number.isFinite(order.total)) : [];
}

function saveOrderLocally(order) {
  const orders = getOrders();
  const existing = orders.findIndex(item => item.orderId === order.orderId);
  if (existing >= 0) orders.splice(existing, 1);
  orders.unshift(order);
  if (typeof saveState === 'function') {
    if (!saveState('techpro_orders', orders) || !saveState('techpro_last_order', order)) throw new Error('Order could not be saved');
  }
}

async function submitOrderToDashboard(order) {
  if (isDemoMode()) {
    const preview = { ...order, isDemo: true, status: 'demo' };
    if (typeof StoreState !== 'undefined') {
      const commit = () => StoreState.commitPreviewOrder(preview);
      return typeof navigator !== 'undefined' && navigator.locks ? navigator.locks.request('techpro-preview-order', commit) : commit();
    }
    saveOrderLocally(preview);
    return preview;
  }
  if (order.items.some(item => item.isDemo !== false)) throw new Error('Demo items cannot be ordered in live mode');
  const data = await requestApi('orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': order.orderId },
    body: JSON.stringify(order)
  });
  const confirmed = data.order || data;
  if (!confirmed || typeof confirmed.orderId !== 'string' || !Number.isFinite(confirmed.total)) throw new Error('Invalid order confirmation');
  const result = { ...order, ...confirmed, isDemo: false };
  saveOrderLocally(result);
  return result;
}

function buildWhatsAppTrackUrl(order) {
  if (!/^[1-9]\d{7,14}$/.test(ADMIN_WHATSAPP)) return '';
  const name = order.customerName || commerceCopy('عميل تيك برو', 'TechPro customer');
  const total = order.total != null ? formatCommerceMoney(order.total) : '';
  const message = [
    commerceCopy('مرحباً إدارة متجر الأرض الذكية / تيك برو،', 'Hello Smart Earth / TechPro admin,'),
    `${commerceCopy('أود متابعة حالة طلبي رقم', 'I would like to track my order')} #${order.orderId}`,
    `${commerceCopy('الاسم', 'Name')}: ${name}`,
    total ? `${commerceCopy('إجمالي الفاتورة', 'Invoice total')}: ${total}` : '',
    commerceCopy('أرجو إفادتي بمسار الشحنة وموعد وصول المندوب.', 'Please update me on shipment status and delivery time.')
  ].filter(Boolean).join('\n');
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

async function seedDemoAccount() {
  if (typeof getAuthUsers !== 'function' || typeof saveState !== 'function') return;
  if (getAuthUsers().length) return;
  saveState('techpro_demo_users_v2', [{
    id: 1,
    name: 'محمد بن أحمد الهنائي',
    nameEn: 'Mohammed Ahmed Al-Hinai',
    phone: '96891234567',
    email: 'mohammed@smartearth.om',
    password: await hashPassword('Demo@123'),
    address: 'مسقط - السيب - حي الخوض التجاري، مبنى 40',
    loyaltyPoints: 320
  }]);
}

function wishlistSnapshotFromProduct(product) {
  return {
    isDemo: product.isDemo === true,
    stock: product.stock,
    nameAr: product.nameAr || product.name,
    nameEn: product.nameEn || product.name,
    image: product.image,
    price: product.price,
    oldPrice: product.oldPrice || null
  };
}

function resolveWishlistProducts() {
  const catalog = typeof STOREFRONT_DEMO_PRODUCTS !== 'undefined' ? STOREFRONT_DEMO_PRODUCTS : [];
  return (typeof wishlist !== 'undefined' ? wishlist : []).map((entry) => {
    const found = entry.isDemo === true ? catalog.find((item) => String(item.id) === String(entry.id)) : null;
    return found ? { ...found, ...entry } : { ...entry, id: entry.id, nameAr: entry.nameAr || 'منتج محفوظ', nameEn: entry.nameEn || 'Saved product', image: entry.image, price: entry.price || 0 };
  });
}

function notifyCommerce(message, type) {
  if (typeof showToast === 'function') showToast(message, type || 'success');
}

function requireCartOrRedirect() {
  if (typeof cart === 'undefined' || !cart.length) {
    window.location.href = typeof getStorefrontPageUrl === 'function' ? getStorefrontPageUrl('cart.html') : 'cart.html';
    return false;
  }
  return true;
}
