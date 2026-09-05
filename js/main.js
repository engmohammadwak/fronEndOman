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
// Cart & Wishlist State
// ========================================
let cart = [];
let wishlist = [];

function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  if (!cartCount || !cartTotal) return;
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartCount.textContent = currentLang === 'ar' 
    ? `سلة المشتريات (${cart.length})` 
    : `Shopping Cart (${cart.length})`;
  cartTotal.textContent = `${total.toFixed(2)} ${currentLang === 'ar' ? 'ر.ع.' : 'OMR'}`;
  
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
  console.log(`Added to cart: ${price} ${currentLang === 'ar' ? 'ر.ع.' : 'OMR'}`);
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
  loadSavedLanguage();
  
  // Load components
  await loadComponent('#header-container', 'components/header.html');
  await loadComponent('#footer-container', 'components/footer.html');
  
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
    cart = JSON.parse(savedCart);
    updateCartDisplay();
  }
  
  if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist);
    updateWishlistDisplay();
  }
});
