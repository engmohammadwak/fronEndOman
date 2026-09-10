/**
 * Public URL map. File locations stay internal; browsers only see these paths.
 */
(function (root) {
  const STOREFRONT = {
    catalog: '/catalog',
    product: '/product',
    cart: '/cart',
    checkout: '/checkout',
    wishlist: '/wishlist',
    account: '/account',
    login: '/login',
    register: '/register',
    'new-devices': '/new-devices',
    'refurbished-devices': '/refurbished-devices',
    'special-offers': '/special-offers',
    brands: '/brands',
    'customer-service': '/customer-service',
    success: '/success',
    'payment-return': '/payment/return',
    'help-center': '/help',
    'track-order': '/track-order',
    'service-centers': '/service-centers',
    'whatsapp-support': '/whatsapp',
    'privacy-policy': '/privacy',
    'return-policy': '/returns',
    'warranty-policy': '/warranty',
    'refurbished-inspection': '/inspection'
  };

  const ADMIN = {
    login: '/dashboard',
    overview: '/dashboard/home',
    home: '/dashboard/home',
    pos: '/dashboard/pos',
    products: '/dashboard/products',
    categories: '/dashboard/categories',
    inventory: '/dashboard/inventory',
    orders: '/dashboard/orders',
    customers: '/dashboard/customers',
    coupons: '/dashboard/coupons',
    cms: '/dashboard/cms',
    content: '/dashboard/content',
    settings: '/dashboard/settings',
    payments: '/dashboard/payments'
  };

  const FILES = {
    '/': 'index.html',
    '/catalog': 'pages/storefront/catalog.html',
    '/product': 'pages/storefront/product.html',
    '/cart': 'pages/storefront/cart.html',
    '/checkout': 'pages/storefront/checkout.html',
    '/wishlist': 'pages/storefront/wishlist.html',
    '/account': 'pages/storefront/account.html',
    '/login': 'pages/storefront/login.html',
    '/register': 'pages/storefront/register.html',
    '/new-devices': 'pages/storefront/new-devices.html',
    '/refurbished-devices': 'pages/storefront/refurbished-devices.html',
    '/special-offers': 'pages/storefront/special-offers.html',
    '/brands': 'pages/storefront/brands.html',
    '/customer-service': 'pages/storefront/customer-service.html',
    '/success': 'pages/storefront/success.html',
    '/payment/return': 'pages/storefront/payment-return.html',
    '/help': 'pages/support/help-center.html',
    '/track-order': 'pages/support/track-order.html',
    '/service-centers': 'pages/support/service-centers.html',
    '/whatsapp': 'pages/support/whatsapp-support.html',
    '/privacy': 'pages/legal/privacy-policy.html',
    '/returns': 'pages/legal/return-policy.html',
    '/warranty': 'pages/legal/warranty-policy.html',
    '/inspection': 'pages/maintenance/refurbished-inspection.html'
  };

  const LEGACY = {
    '/index.html': '/',
    '/pages/storefront/catalog.html': '/catalog',
    '/pages/storefront/product.html': '/product',
    '/pages/storefront/cart.html': '/cart',
    '/pages/storefront/checkout.html': '/checkout',
    '/pages/storefront/wishlist.html': '/wishlist',
    '/pages/storefront/account.html': '/account',
    '/pages/storefront/login.html': '/login',
    '/pages/storefront/register.html': '/register',
    '/pages/storefront/new-devices.html': '/new-devices',
    '/pages/storefront/refurbished-devices.html': '/refurbished-devices',
    '/pages/storefront/special-offers.html': '/special-offers',
    '/pages/storefront/brands.html': '/brands',
    '/pages/storefront/customer-service.html': '/customer-service',
    '/pages/storefront/success.html': '/success',
    '/pages/storefront/payment-return.html': '/payment/return',
    '/pages/support/help-center.html': '/help',
    '/pages/support/track-order.html': '/track-order',
    '/pages/support/service-centers.html': '/service-centers',
    '/pages/support/whatsapp-support.html': '/whatsapp',
    '/pages/legal/privacy-policy.html': '/privacy',
    '/pages/legal/return-policy.html': '/returns',
    '/pages/legal/warranty-policy.html': '/warranty',
    '/pages/maintenance/refurbished-inspection.html': '/inspection',
    '/pages/admin/login.html': '/dashboard',
    '/dashboard/login.html': '/dashboard',
    '/pages/admin/index.html': '/dashboard/home',
    '/pages/admin/app.html': '/dashboard/home',
    '/pages/admin/products.html': '/dashboard/products',
    '/pages/admin/inventory.html': '/dashboard/inventory',
    '/pages/admin/orders.html': '/dashboard/orders',
    '/pages/admin/customers.html': '/dashboard/customers',
    '/pages/admin/coupons.html': '/dashboard/coupons',
    '/pages/admin/cms.html': '/dashboard/cms',
    '/pages/admin/content.html': '/dashboard/content',
    '/pages/admin/settings.html': '/dashboard/settings',
    '/pages/admin/payments.html': '/dashboard/payments'
  };

  function keyOf(name) {
    return String(name || '').replace(/\.html$/i, '').split('/').pop();
  }

  const AppRoutes = {
    STOREFRONT,
    ADMIN,
    FILES,
    LEGACY,
    page(name) {
      const key = keyOf(name);
      if (!key || key === 'index') return '/';
      return STOREFRONT[key] || ADMIN[key] || `/${key}`;
    },
    product(id) {
      return `/product?id=${encodeURIComponent(id)}`;
    },
    admin(page) {
      return ADMIN[page] || '/dashboard';
    },
    fileFor(pathname) {
      const clean = String(pathname || '/').replace(/\/+$/, '') || '/';
      if (clean === '/dashboard') return 'pages/admin/login.html';
      if (Object.values(ADMIN).includes(clean)) return 'pages/admin/app.html';
      return FILES[clean] || null;
    },
    isPublicAsset(pathname) {
      return /^(?:\/css\/|\/js\/|\/assets\/|\/components\/)/.test(pathname);
    }
  };

  root.AppRoutes = AppRoutes;
  if (typeof module !== 'undefined' && module.exports) module.exports = AppRoutes;
})(typeof window !== 'undefined' ? window : globalThis);
