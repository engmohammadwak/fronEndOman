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
// Internationalization (i18n)
// ========================================
const translations = {
  ar: {
    main_title: 'محتوى الصفحة الرئيسية',
    main_desc: 'الهيدر والفوتر يتم تحميلهم ديناميكياً! ✅',
    btn_add_cart: 'إضافة منتج للسلة (150 ر.ع.)',
    btn_add_wishlist: 'إضافة للمفضلة',
    btn_clear_cart: 'إفراغ السلة',
    lang_btn: 'English'
  },
  en: {
    main_title: 'Homepage Content',
    main_desc: 'Header and footer loaded dynamically! ✅',
    btn_add_cart: 'Add to Cart (150 OMR)',
    btn_add_wishlist: 'Add to Wishlist',
    btn_clear_cart: 'Clear Cart',
    lang_btn: 'عربي'
  }
};

let currentLang = 'ar';

function toggleLanguage() {
  const html = document.documentElement;
  const langText = document.getElementById('lang-text');
  
  if (currentLang === 'ar') {
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', 'en');
    currentLang = 'en';
  } else {
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
    currentLang = 'ar';
  }
  
  updateAllTexts();
  if (langText) langText.textContent = translations[currentLang].lang_btn;
  localStorage.setItem('lang', currentLang);
}

function updateAllTexts() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
  
  updateCartDisplay();
}

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
  // Load components
  await loadComponent('#header-container', 'components/header.html');
  await loadComponent('#footer-container', 'components/footer.html');
  
  // Load saved state
  const savedCart = localStorage.getItem('cart');
  const savedWishlist = localStorage.getItem('wishlist');
  const savedLang = localStorage.getItem('lang');
  
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
  }
  
  if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist);
    updateWishlistDisplay();
  }
  
  if (savedLang) {
    currentLang = savedLang;
    const langText = document.getElementById('lang-text');
    const html = document.documentElement;
    
    html.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', savedLang);
    if (langText) langText.textContent = translations[savedLang].lang_btn;
    
    updateAllTexts();
  }
});
