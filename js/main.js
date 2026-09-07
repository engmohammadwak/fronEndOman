// ========================================
// Component Loader
// ========================================
async function loadComponent(selector, file) {
  const container = document.querySelector(selector);
  if (!container) return;
  
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    container.innerHTML = await response.text();
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
  }
}

// ========================================
// Navigation Active State Handler
// ========================================
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isHome = (currentPath === '/' || currentPath.endsWith('index.html')) && href.includes('index.html');
    const isCurrentPage = href && currentPath.endsWith(href.replace(/^\//, ''));

    if (isHome || isCurrentPage) {
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
let cart = [];
let wishlist = [];

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
  
  localStorage.setItem('cart', JSON.stringify(cart));
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
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function addToCart(price) {
  cart.push({ price: price });
  updateCartDisplay();
  const isArabic = typeof currentLang !== 'undefined' ? currentLang === 'ar' : true;
  console.log(`Added to cart: ${price} ${isArabic ? 'ر.ع.' : 'OMR'}`);
}

function addToWishlist() {
  wishlist.push({ id: Date.now() });
  updateWishlistDisplay();
  console.log(`Added to wishlist: ${wishlist.length} items`);
}

function clearCart() {
  cart = [];
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
  
  // Load components
  await loadComponent('#header-container', 'components/header.html');
  await loadComponent('#footer-container', 'components/footer.html');
  
  // Set the active link based on current page URL
  setActiveNavLink();

  // Update all texts after header and footer are inserted into the page
  if (typeof updateAllTexts === 'function') {
    updateAllTexts();
  }

  // Tell i18n that dynamically loaded components are ready
  document.dispatchEvent(new CustomEvent('componentsLoaded'));
  
  // Load saved state
  const savedCart = localStorage.getItem('cart');
  const savedWishlist = localStorage.getItem('wishlist');
  
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartDisplay();
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
    }
  }
  
  if (savedWishlist) {
    try {
      wishlist = JSON.parse(savedWishlist);
      updateWishlistDisplay();
    } catch (e) {
      console.error('Error parsing wishlist from localStorage:', e);
    }
  }
});