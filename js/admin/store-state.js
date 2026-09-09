/**
 * Central store engine shared by the admin dashboard and the storefront.
 * Local persistence now; the same methods can later POST to a Laravel API.
 */
const StoreState = (() => {
  const KEYS = {
    PRODUCTS: 'techpro_products_db',
    CMS: 'techpro_cms_db',
    COUPONS: 'techpro_coupons_db',
    SETTINGS: 'techpro_settings_db',
    LANG: 'techpro_dashboard_lang'
  };

  const ORDERS_KEY = 'techpro_orders';

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    try {
      document.dispatchEvent(new CustomEvent('storeStateChanged', { detail: { key } }));
    } catch {}
    return value;
  }

  function catalogSeed() {
    const source = typeof STOREFRONT_DEMO_PRODUCTS !== 'undefined' ? STOREFRONT_DEMO_PRODUCTS : [];
    return source.map((item) => ({
      ...item,
      stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : 5,
      sku: item.sku || `TP-${item.id}`,
      condition: item.listingType === 'refurbished' ? 'refurbished' : 'new',
      active: item.active !== false
    }));
  }

  function defaultCms() {
    return {
      announcement: {
        enabled: true,
        textAr: 'شحن مجاني لجميع الطلبات فوق 200 ر.ع. | ضمان ذهبي لمدة عامين',
        textEn: 'Free shipping on orders over 200 OMR | Certified 2-year gold warranty'
      },
      strings: {
        ar: {
          banner_text: 'شحن مجاني لجميع الطلبات فوق 200 ر.ع. | ضمان ذهبي لمدة عامين',
          store_desc: 'متجر الأجهزة والتقنية المعتمد',
          hero_title: 'عصر التكنولوجيا بأسعار استثنائية',
          hero_desc: 'جديد ومجدد بموثوقية 100% مع ضمان معتمد وتوصيل سريع داخل السلطنة.',
          nav_home: 'الرئيسية',
          nav_new_devices: 'الأجهزة الجديدة',
          nav_refurbished: 'الأجهزة المستعملة والمجددة',
          nav_special_offers: 'العروض الخاصة',
          nav_brands: 'الماركات',
          nav_customer_service: 'خدمة العملاء',
          add_to_cart: 'إضافة',
          fast_delivery: 'توصيل سريع خلال 24 ساعة'
        },
        en: {
          banner_text: 'Free shipping on orders over 200 OMR | Certified 2-year gold warranty',
          store_desc: 'Certified devices and technology store',
          hero_title: 'Technology at exceptional prices',
          hero_desc: 'New and refurbished devices with certified warranty and fast delivery across Oman.',
          nav_home: 'Home',
          nav_new_devices: 'New devices',
          nav_refurbished: 'Refurbished devices',
          nav_special_offers: 'Special offers',
          nav_brands: 'Brands',
          nav_customer_service: 'Customer service',
          add_to_cart: 'Add',
          fast_delivery: 'Fast delivery within 24 hours'
        }
      },
      faqs: [
        { id: 1, category: 'orders', qAr: 'كم يستغرق توصيل الطلب؟', qEn: 'How long does delivery take?', aAr: 'داخل مسقط 24 إلى 48 ساعة، وبقية المحافظات من يومين إلى 4 أيام عمل.', aEn: 'Muscat: 24-48 hours. Other governorates: 2-4 working days.' },
        { id: 2, category: 'returns', qAr: 'ما مهلة الاسترجاع؟', qEn: 'What is the return window?', aAr: '15 يوماً من الاستلام إذا وُجد عيب مصنعي أو اختلاف عن المواصفات.', aEn: '15 days from delivery for manufacturing defects or spec mismatch.' },
        { id: 3, category: 'warranty', qAr: 'هل يشمل الضمان الأجهزة المجددة؟', qEn: 'Does warranty cover refurbished devices?', aAr: 'نعم، ضمان تشغيلي من 6 إلى 12 شهراً حسب المنتج، والذهبي سنتان للجديد.', aEn: 'Yes. Refurbished units have 6-12 months cover; new devices get the 2-year gold plan.' }
      ],
      branches: [
        { id: 1, nameAr: 'مركز الصيانة الرئيسي - مسقط', nameEn: 'Main service center - Muscat', cityAr: 'مسقط', cityEn: 'Muscat', addressAr: 'السيب - الخوض، شارع مزون', addressEn: 'Seeb, Al Khoudh, Mazoon Street', hoursAr: 'السبت - الخميس: 9:00 ص - 9:30 م', hoursEn: 'Sat-Thu: 9:00 AM - 9:30 PM', phone: '96824501100', mapUrl: 'https://maps.google.com/?q=Al+Khoudh+Muscat' },
        { id: 2, nameAr: 'مركز خدمة الباطنة - صحار', nameEn: 'Batinah service center - Sohar', cityAr: 'صحار', cityEn: 'Sohar', addressAr: 'الهمبار، شارع الميناء', addressEn: 'Al Hambar, Port Street', hoursAr: 'السبت - الخميس: 9:30 ص - 8:30 م', hoursEn: 'Sat-Thu: 9:30 AM - 8:30 PM', phone: '96826842200', mapUrl: 'https://maps.google.com/?q=Sohar+Oman' }
      ],
      policies: {
        warrantyAr: 'يغطي الضمان الذهبي العيوب المصنعية لمدة 24 شهراً للأجهزة الجديدة، و6 إلى 12 شهراً للمجددة حسب الفاتورة.',
        warrantyEn: 'Gold warranty covers manufacturing defects for 24 months on new devices and 6-12 months on refurbished units as stated on the invoice.',
        returnAr: 'يمكن الإرجاع خلال 15 يوماً من الاستلام إذا وُجد عيب أو اختلاف عن المواصفات، بعد الفحص في مركز معتمد.',
        returnEn: 'Returns are accepted within 15 days of delivery for defects or spec mismatch after inspection at an authorized center.',
        privacyAr: 'نحتفظ ببيانات الطلب والتوصيل لتشغيل المتجر وتتبع الشحنات، ولا نبيع بيانات العملاء لأطراف غير مرتبطة بالتنفيذ.',
        privacyEn: 'Order and delivery data are kept to operate the store and shipments. Customer data is not sold to unrelated third parties.'
      }
    };
  }

  function defaultCoupons() {
    return [
      { id: 1, code: 'TECH2026', type: 'fixed', amount: 100, minOrder: 0, expires: '2026-12-31', active: true },
      { id: 2, code: 'WELCOME10', type: 'percent', amount: 10, minOrder: 200, expires: '2026-12-31', active: true }
    ];
  }

  function defaultSettings() {
    return {
      whatsappAdmin: '',
      lowStock: 3,
      storeNameAr: 'الأرض الذكية / تيك برو',
      storeNameEn: 'Smart Earth / TechPro',
      currencyAr: 'ر.ع.',
      currencyEn: 'OMR'
    };
  }

  function syncFromCatalog(list) {
    if (Array.isArray(read(KEYS.PRODUCTS, null)) || !Array.isArray(list) || !list.length) return getProducts();
    return saveProducts(list.map((item) => ({
      ...item,
      stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : 5,
      sku: item.sku || `TP-${item.id}`,
      condition: item.listingType === 'refurbished' ? 'refurbished' : 'new',
      active: item.active !== false
    })));
  }

  function ensure() {
    const products = read(KEYS.PRODUCTS, null);
    if (!Array.isArray(products)) {
      const seeded = catalogSeed();
      if (seeded.length) write(KEYS.PRODUCTS, seeded);
      else if (!Array.isArray(products)) write(KEYS.PRODUCTS, []);
    }
    if (!read(KEYS.CMS, null) || typeof read(KEYS.CMS, null) !== 'object') write(KEYS.CMS, defaultCms());
    if (!Array.isArray(read(KEYS.COUPONS, null))) write(KEYS.COUPONS, defaultCoupons());
    if (!read(KEYS.SETTINGS, null) || typeof read(KEYS.SETTINGS, null) !== 'object') write(KEYS.SETTINGS, defaultSettings());
    if (!Array.isArray(read(ORDERS_KEY, null))) write(ORDERS_KEY, []);
  }

  try { ensure(); } catch { /* UI initialization reports unavailable storage. */ }

  function getProducts() {
    const list = read(KEYS.PRODUCTS, []);
    return Array.isArray(list) ? list : [];
  }

  function getProduct(id) {
    return getProducts().find((item) => String(item.id) === String(id)) || null;
  }

  function saveProducts(list) {
    return write(KEYS.PRODUCTS, list);
  }

  function upsertProduct(product) {
    if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0 || !Number.isSafeInteger(Number(product.stock)) || Number(product.stock) < 0) throw new Error('Invalid product price or stock');
    const list = getProducts();
    const id = product.id || Date.now();
    const next = { ...product, id, stock: Math.max(0, Number(product.stock || 0)), active: product.active !== false };
    const index = list.findIndex((item) => String(item.id) === String(id));
    if (index >= 0) list[index] = { ...list[index], ...next };
    else list.unshift(next);
    saveProducts(list);
    return next;
  }

  function deleteProduct(id) {
    saveProducts(getProducts().filter((item) => String(item.id) !== String(id)));
  }

  function availableStock(id) {
    const product = getProduct(id);
    return product ? Math.max(0, Number(product.stock || 0)) : 0;
  }

  function cartQtyFor(id) {
    try {
      const cart = JSON.parse(localStorage.getItem(typeof stateStorageKey === 'function' ? stateStorageKey('cart') : 'cart') || '[]');
      return (Array.isArray(cart) ? cart : [])
        .filter((item) => String(item.productId || item.id) === String(id))
        .reduce((sum, item) => sum + Number(item.qty || 1), 0);
    } catch {
      return 0;
    }
  }

  function remainingForBuyer(id) {
    return Math.max(0, availableStock(id) - cartQtyFor(id));
  }

  function canSell(id, qty) {
    const item = getProduct(id);
    return !!item && item.active !== false && Number.isSafeInteger(Number(qty)) && Number(qty) > 0 && availableStock(id) >= Number(qty);
  }

  function deductStock(productId, qty = 1) {
    const amount = Number(qty || 1);
    if (!Number.isSafeInteger(amount) || amount <= 0) return false;
    const list = getProducts();
    const item = list.find((product) => String(product.id) === String(productId));
    if (!item || Number(item.stock || 0) < amount) return false;
    item.stock = Number(item.stock) - amount;
    saveProducts(list);
    return true;
  }

  function restoreStock(productId, qty = 1) {
    if (!Number.isSafeInteger(Number(qty)) || Number(qty) <= 0) return false;
    const list = getProducts();
    const item = list.find((product) => String(product.id) === String(productId));
    if (!item) return false;
    item.stock = Number(item.stock || 0) + Number(qty || 1);
    saveProducts(list);
    return true;
  }

  function planDeduction(items) {
    const totals = new Map();
    for (const line of items || []) {
      if (!line || line.productId == null || !Number.isSafeInteger(Number(line.qty ?? 1)) || Number(line.qty ?? 1) <= 0) return { ok: false };
      const id = String(line.productId);
      totals.set(id, (totals.get(id) || 0) + Number(line.qty ?? 1));
    }
    const products = getProducts();
    for (const [id, qty] of totals) {
      const item = products.find(product => String(product.id) === id);
      if (!item || item.active === false || Number(item.stock) < qty) return { ok: false, productId: id };
      item.stock = Number(item.stock) - qty;
    }
    return { ok: true, products };
  }

  function deductCart(items) {
    const plan = planDeduction(items);
    if (plan.ok) saveProducts(plan.products);
    return { ok: plan.ok, productId: plan.productId };
  }

  function commitPreviewOrder(order) {
    const existing = getOrders().find(item => item.orderId === order.orderId);
    if (existing) return existing;
    const plan = planDeduction(order.items);
    if (!plan.ok) throw new Error('Requested stock unavailable');
    const before = [KEYS.PRODUCTS, ORDERS_KEY, 'techpro_last_order'].map(key => [key, localStorage.getItem(key)]);
    try {
      saveProducts(plan.products);
      return addOrder({ ...order, isDemo: true, inventoryDeducted: true, inventoryRestored: false });
    } catch (error) {
      for (const [key, value] of before) {
        try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch {}
      }
      throw error;
    }
  }

  function getOrders() {
    const list = read(ORDERS_KEY, []);
    return Array.isArray(list) ? list.filter((order) => order && order.orderId) : [];
  }

  function addOrder(order) {
    const orders = getOrders();
    const next = {
      status: 'processing',
      ...order,
      createdAt: order.createdAt || new Date().toISOString()
    };
    if (!['received', 'processing', 'shipped', 'delivered', 'cancelled'].includes(next.status)) {
      next.status = 'processing';
    }
    const index = orders.findIndex((item) => item.orderId === next.orderId);
    if (index >= 0) orders.splice(index, 1);
    orders.unshift(next);
    write(ORDERS_KEY, orders);
    try { localStorage.setItem('techpro_last_order', JSON.stringify(next)); } catch {}
    return next;
  }

  function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const order = orders.find((item) => item.orderId === orderId);
    if (!order) return null;
    if (!['received', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) throw new Error('Invalid order status');
    if (order.status === 'cancelled' && status !== 'cancelled') throw new Error('Cancelled orders cannot be reopened');
    const previous = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'cancelled' && previous !== 'cancelled' && order.inventoryDeducted && !order.inventoryRestored) {
      (order.items || []).forEach((item) => {
        if (item.productId != null) restoreStock(item.productId, item.qty || 1);
      });
    }
    if (status === 'cancelled' && order.inventoryDeducted) order.inventoryRestored = true;
    write(ORDERS_KEY, orders);
    return order;
  }

  function getCms() {
    const cms = read(KEYS.CMS, null);
    return cms && typeof cms === 'object' ? cms : defaultCms();
  }

  function saveCms(cms) {
    return write(KEYS.CMS, cms);
  }

  function getCoupons() {
    const list = read(KEYS.COUPONS, []);
    return Array.isArray(list) ? list : [];
  }

  function saveCoupons(list) {
    return write(KEYS.COUPONS, list);
  }

  function findCoupon(code) {
    const typed = String(code || '').trim().toUpperCase();
    const coupon = getCoupons().find((item) => item.active && String(item.code).toUpperCase() === typed);
    if (!coupon) return null;
    if (coupon.expires && new Date(coupon.expires) < new Date(new Date().toDateString())) return null;
    return coupon;
  }

  function couponValue(coupon, subtotal) {
    if (!coupon || Number(subtotal) < Number(coupon.minOrder || 0)) return 0;
    if (coupon.type === 'percent') return Math.round(Number(subtotal) * Number(coupon.amount) / 100);
    return Number(coupon.amount || 0);
  }

  function getSettings() {
    return { ...defaultSettings(), ...(read(KEYS.SETTINGS, {}) || {}) };
  }

  function saveSettings(settings) {
    return write(KEYS.SETTINGS, { ...getSettings(), ...settings });
  }

  function getCustomers() {
    const map = new Map();
    getOrders().forEach((order) => {
      const key = order.phone || order.email || order.customerName;
      if (!key) return;
      const current = map.get(key) || {
        name: order.customerName,
        phone: order.phone,
        email: order.email || '',
        address: order.address || '',
        orders: 0,
        total: 0
      };
      current.orders += 1;
      current.total += Number(order.total || 0);
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  function kpis() {
    const products = getProducts();
    const orders = getOrders();
    const settings = getSettings();
    const paid = orders.filter((order) => order.status !== 'cancelled');
    const wishlist = read('wishlist', []);
    return {
      sales: paid.reduce((sum, order) => sum + Number(order.total || 0), 0),
      orders: orders.length,
      openOrders: orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length,
      units: products.reduce((sum, item) => sum + Number(item.stock || 0), 0),
      lowStock: products.filter((item) => Number(item.stock || 0) > 0 && Number(item.stock) <= Number(settings.lowStock || 3)).length,
      outOfStock: products.filter((item) => Number(item.stock || 0) <= 0).length,
      wishlist: Array.isArray(wishlist) ? wishlist.length : 0,
      customers: getCustomers().length
    };
  }

  function applyLiveProduct(product) {
    if (!product) return product;
    const live = getProduct(product.id);
    return live ? { ...product, ...live, stock: Number(live.stock || 0), active: live.active !== false } : product;
  }

  return {
    KEYS,
    ensure,
    syncFromCatalog,
    getProducts,
    getProduct,
    saveProducts,
    upsertProduct,
    deleteProduct,
    availableStock,
    remainingForBuyer,
    canSell,
    deductStock,
    restoreStock,
    deductCart,
    commitPreviewOrder,
    applyLiveProduct,
    getOrders,
    addOrder,
    updateOrderStatus,
    getCms,
    saveCms,
    getCoupons,
    saveCoupons,
    findCoupon,
    couponValue,
    getSettings,
    saveSettings,
    getCustomers,
    kpis,
    getLang: () => localStorage.getItem(KEYS.LANG) || 'ar',
    setLang: (lang) => localStorage.setItem(KEYS.LANG, lang === 'en' ? 'en' : 'ar')
  };
})();

window.StoreState = StoreState;
