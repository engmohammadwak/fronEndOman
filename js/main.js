const appBaseUrl = new URL('../', document.currentScript.src);

function readSavedState(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function saveState(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { console.warn('Storage unavailable:', error); }
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
    const isHome = currentPath === appBaseUrl.pathname && targetPath === new URL('index.html', appBaseUrl).pathname;
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
let cart = readSavedState('cart', []);
cart = Array.isArray(cart) ? cart.filter(item => item && Number.isFinite(item.price) && item.price >= 0) : [];
let wishlist = readSavedState('wishlist', []);
wishlist = Array.isArray(wishlist) ? wishlist : [];

function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  if (!cartCount || !cartTotal) return;
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const isArabic = typeof currentLang !== 'undefined' ? currentLang === 'ar' : true;

  cartCount.textContent = isArabic 
    ? `سلة المشتريات (${cart.length})` 
    : `Shopping Cart (${cart.length})`;
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

function addToCart(price) {
  if (!Number.isFinite(price) || price < 0) return;
  cart.push({ price: price });
  saveState('cart', cart);
  updateCartDisplay();
  const isArabic = typeof currentLang !== 'undefined' ? currentLang === 'ar' : true;
  console.log(`Added to cart: ${price} ${isArabic ? 'ر.ع.' : 'OMR'}`);
}

function addToWishlist(productId) {
  const id = productId == null ? Date.now() : productId;
  if (wishlist.some(item => item.id === id)) return;
  wishlist.push({ id });
  saveState('wishlist', wishlist);
  updateWishlistDisplay();
  console.log(`Added to wishlist: ${wishlist.length} items`);
}

function clearCart() {
  cart = [];
  saveState('cart', cart);
  updateCartDisplay();
  console.log('Cart cleared');
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
});
