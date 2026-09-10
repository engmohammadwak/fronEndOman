const appBaseUrl = new URL('../', document.currentScript.src);

const AUTH_SESSION_KEY = 'techpro_demo_session_v2';

function validLocalSession(session) {
  return !!session && session.loggedIn === true &&
    ((typeof session.id === 'string' && session.id.trim() !== '') ||
      (typeof session.id === 'number' && Number.isFinite(session.id))) &&
    typeof session.name === 'string';
}

function readPersistentSession() {
  if (typeof isDemoMode === 'function' && !isDemoMode()) return null;
  try {
    let raw = localStorage.getItem(AUTH_SESSION_KEY);
    // Migrate the previous tab-only session once, before cart hydration.
    // Explicit logout stores "null", preventing stale tabs from signing back in.
    if (raw === null) {
      let legacy = null;
      try { legacy = JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY)); } catch {}
      if (validLocalSession(legacy)) {
        raw = JSON.stringify(legacy);
        localStorage.setItem(AUTH_SESSION_KEY, raw);
        try { sessionStorage.removeItem(AUTH_SESSION_KEY); } catch {}
      }
    }
    const session = raw ? JSON.parse(raw) : null;
    return validLocalSession(session) ? session : null;
  } catch { return null; }
}

function stateStorageKey(key) {
  if (!['cart', 'wishlist', 'techpro_promo', 'techpro_pending_order'].includes(key)) return key;
  const session = readPersistentSession();
  return session ? `${key}:user:${session.id}` : key;
}

function readSavedState(key, fallback) {
  try { return JSON.parse(localStorage.getItem(stateStorageKey(key))) ?? fallback; }
  catch { return fallback; }
}

function saveState(key, value) {
  try { localStorage.setItem(stateStorageKey(key), JSON.stringify(value)); return true; }
  catch { return false; }
}

// ========================================
// Component Loader
// ========================================
async function loadComponent(selector, file) {
  const container = document.querySelector(selector);
  if (!container) return;
  
  try {
    const response = await fetch(file.startsWith('http://') || file.startsWith('https://')
      ? file
      : new URL(file, appBaseUrl), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    container.innerHTML = await response.text();
    container.querySelectorAll('a[href^="/"]').forEach(link => {
      link.href = new URL(link.getAttribute('href').slice(1), appBaseUrl).href;
    });
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

// ========================================
// Navigation Active State Handler
// ========================================
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const activeNav = document.body && document.body.dataset ? document.body.dataset.activeNav : '';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const targetPath = href ? new URL(href, window.location.href).pathname : null;
    const isHome = currentPath === '/' || currentPath === appBaseUrl.pathname || currentPath === new URL('/', appBaseUrl).pathname;
    const isCurrentPage = targetPath === currentPath;
    const isActiveNav = activeNav && link.dataset.nav === activeNav;

    if (isActiveNav || isHome || isCurrentPage) {
      link.classList.add('text-tertiary-fixed', 'font-bold', 'border-b-2', 'border-tertiary-fixed');
      link.classList.remove('text-secondary-fixed');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('text-tertiary-fixed', 'font-bold', 'border-b-2', 'border-tertiary-fixed');
      link.classList.add('text-secondary-fixed', 'hover:text-surface-container-lowest');
      link.removeAttribute('aria-current');
    }
  });
}

// ========================================
// Cart & Wishlist State
// ========================================
function hydrateWishlist() {
  const list = readSavedState('wishlist', []);
  return Array.isArray(list) ? list.filter(item => item && item.id != null) : [];
}

let cart = readSavedState('cart', []);
cart = Array.isArray(cart) ? cart.filter(item => item && Number.isFinite(item.price) && item.price >= 0 && validCartQuantity(item.qty ?? 1)) : [];
let wishlist = hydrateWishlist();

function persistWishlist() {
  saveState('wishlist', wishlist);

  updateWishlistDisplay();
}

function validCartQuantity(value) {
  return Number.isSafeInteger(Number(value)) && Number(value) > 0 && Number(value) <= 999;
}

function cartLineTotal(item) {
  if (!item) return 0;
  const qty = Number(item.qty || 1);
  const base = Number(item.price || 0) * qty;
  const addon = item.addonActive ? Number(item.addonPrice || 0) : 0;
  return base + addon;
}

function cartGrandTotal(list) {
  return (list || cart).reduce((sum, item) => sum + cartLineTotal(item), 0);
}

function cartConditionKey(item) {
  const text = `${item.conditionAr || ''} ${item.conditionEn || ''} ${item.condition || ''}`.toLowerCase();
  if (/مجدد|refurb/.test(text)) return 'refurbished';
  if (/جديد|new|sealed/.test(text)) return 'new';
  return text.trim();
}

function cartLineKey(item) {
  return [item.productId ?? item.id ?? '', String(item.variantId || ''), String(item.storage || ''), String(item.colorId || item.colorEn || item.colorAr || ''), cartConditionKey(item)].join('|');
}

function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  if (!cartCount || !cartTotal) return;

  const total = cartGrandTotal();
  const isArabic = typeof currentLang !== 'undefined' ? currentLang === 'ar' : true;

  cartCount.textContent = isArabic
    ? `سلة المشتريات (${cart.reduce((sum, item) => sum + Number(item.qty || 1), 0)})`
    : `Shopping Cart (${cart.reduce((sum, item) => sum + Number(item.qty || 1), 0)})`;
  cartTotal.textContent = `${total.toFixed(2)} ${isArabic ? 'ر.ع.' : 'OMR'}`;
}

function updateWishlistDisplay() {
  const wishlistCount = document.getElementById('wishlist-count');
  if (!wishlistCount) return;

  if (wishlist.length > 0) {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.style.display = 'flex';
  } else {
    wishlistCount.style.display = 'none';
  }
}

function addToCart(priceOrItem) {
  const previous = cart.map(item => ({ ...item }));
  if (priceOrItem && typeof priceOrItem === 'object') {
    const price = Number(priceOrItem.price);
    if (!Number.isFinite(price) || price < 0) return false;
    if (!validCartQuantity(priceOrItem.qty ?? 1)) return false;
    const incoming = {
      ...priceOrItem,
      productId: priceOrItem.productId ?? priceOrItem.id,
      price,
      qty: Math.max(1, Number(priceOrItem.qty || 1))
    };
    const existing = cart.find((item) => item.productId != null && cartLineKey(item) === cartLineKey(incoming));
    const liveStock = (isDemoMode() && typeof StoreState !== 'undefined' && incoming.productId != null && StoreState.getProduct(incoming.productId))
      ? StoreState.availableStock(incoming.productId)
      : incoming.stock;
    if (liveStock != null && incoming.qty + Number(existing?.qty || 0) > Number(liveStock)) return false;
    if (existing && !validCartQuantity(Number(existing.qty || 1) + incoming.qty)) return false;
    if (existing) existing.qty = Number(existing.qty || 1) + incoming.qty;
    else cart.push(incoming);
  } else {
    if (!Number.isFinite(priceOrItem) || priceOrItem < 0) return false;
    cart.push({ price: priceOrItem });
    const isArabic = typeof currentLang !== 'undefined' ? currentLang === 'ar' : true;

  }
  if (!saveState('cart', cart)) { cart = previous; return false; }
  updateCartDisplay();
  return true;
}

function addToWishlist(productId, snapshot) {
  const id = productId == null ? Date.now() : productId;
  if (wishlist.some(item => String(item.id) === String(id))) return false;
  wishlist.push(snapshot && typeof snapshot === 'object' ? { id, ...snapshot } : { id });
  persistWishlist();

  return true;
}

function toggleWishlist(productId, snapshot) {
  const id = productId;
  const index = wishlist.findIndex((item) => String(item.id) === String(id));
  if (index >= 0) {
    wishlist.splice(index, 1);
    persistWishlist();
    return false;
  }
  addToWishlist(id, snapshot);
  return true;
}

function isInWishlist(productId) {
  return wishlist.some((item) => String(item.id) === String(productId));
}

function clearCart() {
  if (!saveState('cart', [])) return false;
  cart = [];
  updateCartDisplay();

}

function getStorefrontPageUrl(page) {
  const path = (typeof AppRoutes !== 'undefined' && typeof AppRoutes.page === 'function')
    ? AppRoutes.page(page)
    : `/${String(page || '').replace(/\.html$/i, '')}`;
  return new URL(String(path).replace(/^\//, ''), appBaseUrl).href;
}

function updateAccountDisplay() {
  const label = document.getElementById('header-account-label');
  const link = document.getElementById('header-account-link');
  const session = getAuthSession();
  const isArabic = typeof currentLang !== 'undefined' ? currentLang === 'ar' : true;
  if (label) {
    if (session) {
      label.removeAttribute('data-i18n');
      label.textContent = isArabic ? session.name.split(' ')[0] : (session.nameEn || session.name).split(' ')[0];
    } else if (typeof translations !== 'undefined' && translations[isArabic ? 'ar' : 'en']) {
      label.setAttribute('data-i18n', 'my_account');
      label.textContent = translations[isArabic ? 'ar' : 'en'].my_account || (isArabic ? 'حسابي' : 'Account');
    }
  }
  if (link) {
    link.href = getStorefrontPageUrl('account.html');
  }
}

function bindHeaderCommerceLinks() {
  const wish = document.getElementById('header-wishlist-link');
  const cartLink = document.getElementById('header-cart-link');
  if (wish) wish.href = getStorefrontPageUrl('wishlist.html');
  if (cartLink) cartLink.href = getStorefrontPageUrl('cart.html');
  updateAccountDisplay();
}

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
  // Load saved language first
  if (typeof loadSavedLanguage === 'function') {
    loadSavedLanguage();
  }
  
  // Load components from page attributes when present, otherwise from the app root.
  const headerPath = document.body && document.body.dataset && document.body.dataset.headerPath;
  const footerPath = document.body && document.body.dataset && document.body.dataset.footerPath;
  await loadComponent('#header-container', headerPath
    ? new URL(headerPath, window.location.href).href
    : 'components/header.html');
  await loadComponent('#footer-container', footerPath
    ? new URL(footerPath, window.location.href).href
    : 'components/footer.html');
  
  // Set the active link based on current page URL
  setActiveNavLink();

  // Update all texts after header and footer are inserted into the page
  if (typeof updateAllTexts === 'function') {
    updateAllTexts();
  }

  // Tell i18n that dynamically loaded components are ready
  document.dispatchEvent(new CustomEvent('componentsLoaded'));
  
  updateCartDisplay();
  updateWishlistDisplay();
  bindHeaderCommerceLinks();
  bindHeaderSearch();
  bindSecretAdminGate();
});

function bindSecretAdminGate() {
  document.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey && event.shiftKey && (event.key === 'A' || event.key === 'a'))) return;
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
    event.preventDefault();
    window.location.href = (typeof AppRoutes !== 'undefined' && AppRoutes.admin)
      ? new URL(AppRoutes.admin('login'), appBaseUrl).href
      : new URL('/dashboard', appBaseUrl).href;
  });
}

function getCatalogResultsUrl(query, category, condition) {
  const url = new URL((typeof AppRoutes !== 'undefined' && AppRoutes.page) ? AppRoutes.page('catalog') : '/catalog', appBaseUrl);
  if (query) url.searchParams.set('q', query);
  if (category && category !== 'all') url.searchParams.set('cat', category);
  if (condition && condition !== 'all') url.searchParams.set('condition', condition);
  return url.href;
}

function isCatalogResultsPage() {
  return /\/catalog(?:\.html)?$/.test(window.location.pathname);
}

function bindHeaderSearch() {
  const form = document.getElementById('header-search-form');
  const input = document.getElementById('header-search-input');
  const category = document.getElementById('header-category-select');
  if (!form && !input) return;

  const submitSearch = () => {
    const query = (input && input.value ? input.value : '').trim();
    const cat = (category && category.value) || 'all';

    if (typeof window.applyCatalogQuery === 'function' && isCatalogResultsPage()) {
      window.applyCatalogQuery({ q: query, cat });
      return;
    }

    window.location.href = getCatalogResultsUrl(query, cat);
  };

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitSearch();
    });
  }

  const button = document.getElementById('header-search-button');
  if (button) {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      submitSearch();
    });
  }
}

function restoreCommerceState() {
  const savedCart = readSavedState('cart', []);
  cart = Array.isArray(savedCart) ? savedCart.filter(item => item && Number.isFinite(item.price) && item.price >= 0 && validCartQuantity(item.qty ?? 1)) : [];
  wishlist = hydrateWishlist();
  updateCartDisplay();
  updateWishlistDisplay();
}

// Other tabs must not keep rendering or writing a previous account's cart.
if (typeof window.addEventListener === 'function') {
  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== AUTH_SESSION_KEY &&
        !['cart', 'wishlist', 'techpro_promo'].some(key => event.key === stateStorageKey(key))) return;
    restoreCommerceState();
    if (typeof updateAccountDisplay === 'function') updateAccountDisplay();
    window.dispatchEvent(new CustomEvent('commerceStateChanged', { detail: { sessionChanged: event.key === null || event.key === AUTH_SESSION_KEY } }));
  });
}
