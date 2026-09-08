const demoNewDevices = [
  {
    id: 1,
    nameAr: 'آيفون 15 برو - تيتانيوم طبيعي 256GB',
    nameEn: 'iPhone 15 Pro - Natural Titanium 256GB',
    brand: 'Apple',
    category: 'phones',
    price: 4699,
    oldPrice: null,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.9,
    reviews: 128,
    stock: 12,
    badgeAr: 'جديد',
    badgeEn: 'New',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxiKwuYNFuk0d-8B4L_Vurbbh4mDLOhku3uTwOSKtWPtNperXc4KkghVycgasTVn8oWnoewAdQTzJ5FyozYpk9j_jtUs0euMoUU2Rrsq4KW1c4auSzDY4rrCLq5kn5Zyn_EaV91aoRI3Yq8iGPJMycxvaKrT9i8tjqQdzzfwl3dIMKrVzKyTEwBYla0sM0YIVADb7tqMfdJcrahvtqY1OUaXb-apY2ZM4zozka1PXIyv_USY0wV4fYWQ',
    isDemo: true
  },
  {
    id: 2,
    nameAr: 'ماك بوك برو M3 بشاشة 14 إنش',
    nameEn: 'MacBook Pro M3 14-inch',
    brand: 'Apple',
    category: 'laptops',
    price: 7299,
    oldPrice: null,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 5.0,
    reviews: 74,
    stock: 8,
    badgeAr: 'جديد',
    badgeEn: 'New',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD81RIVCanEtE0Ty0Gfa__H-n6egIbsoeWcx6XEuDA1lxDVV1zIoibEzG6FFDms-c7dbXJAUxDLdaWs31G5URkP1NI3PBP31IkVqmNCDuzJiNstf2wTFNIa1xegrpT6Wfmi8S0RZT3dzVRlGoI2GJHJcoZjQBBt1nGvDj8yEaRKEWoHXjXk9LDICk6c9S-NSuebWRkVamrJfCAuqqjMArNpU2_Em7J0xvxqYtlhQvcq2nUKNHW-LVjMWQ',
    isDemo: true
  },
  {
    id: 3,
    nameAr: 'ساعة سامسونج جالاكسي ووتش 6 كلاسيك',
    nameEn: 'Samsung Galaxy Watch 6 Classic',
    brand: 'Samsung',
    category: 'watches',
    price: 1149,
    oldPrice: 1399,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.7,
    reviews: 92,
    stock: 15,
    badgeAr: 'خصم 18%',
    badgeEn: '18% OFF',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4DngFbmZBlKbwCjBhRZsX0xRWWSWdQcxOiVOxUSeuoT5HFo4fQx54A4oXnf4gGsuVYm-VdqIOgfxSo1UFFhUsvacWOuULAnG9JbSsxeBrX1PheAeOu48sPBHxvsHyLXO_kXOgW5WtkVaafjXIau6khaANf0ULOa_TAA9mwfa9vRRUDNR1XnRlcxhZ8gHwCkbYeK3pXuykyzqPy1tHUgKYk06tI5ZhG10XiAyhXIcsyu5wsUEcI-8G8Q',
    isDemo: true
  },
  {
    id: 4,
    nameAr: 'سماعات سوني WH-1000XM5 العازلة للضوضاء',
    nameEn: 'Sony WH-1000XM5 Noise-Canceling Headphones',
    brand: 'Sony',
    category: 'accessories',
    price: 1299,
    oldPrice: null,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.8,
    reviews: 215,
    stock: 22,
    badgeAr: 'جديد',
    badgeEn: 'New',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0uWNGnGLzXvr_3smeWRyzp4XBQNvk1FZ7kpcHiiokRJqxF9Zjg3EYAeEEHUgpItCGq0Pxji5CojDheLQkH7tfBIOBmfcpjPjWYohdA8QdAiqInicYrOvTX_PjtSm3CV7H1rMSCaVOKQ8BgG3DX2ZL5oHsakQtnN8wEtIHRRs_HBGehHYl0h7BSErUkOX03umkRSp73poRH6PcKtT-aw73qHaARluHJv33M19oblr7twh1myeZ_Mzp7A',
    isDemo: true
  },
  {
    id: 5,
    nameAr: 'سامسونج جالاكسي S24 ألترا 256GB',
    nameEn: 'Samsung Galaxy S24 Ultra 256GB',
    brand: 'Samsung',
    category: 'phones',
    price: 3999,
    oldPrice: 4299,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.8,
    reviews: 163,
    stock: 10,
    badgeAr: 'خصم 7%',
    badgeEn: '7% OFF',
    image: '../../assets/images/product-placeholder.svg',
    isDemo: true
  },
  {
    id: 6,
    nameAr: 'آيباد برو 13 إنش شريحة M4',
    nameEn: 'iPad Pro 13-inch M4',
    brand: 'Apple',
    category: 'tablets',
    price: 5499,
    oldPrice: null,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.9,
    reviews: 61,
    stock: 6,
    badgeAr: 'جديد',
    badgeEn: 'New',
    image: '../../assets/images/product-placeholder.svg',
    isDemo: true
  }
];

let pageData = [];
let usingDemoData = true;
let activeCategory = 'all';
let activeBrand = 'all';
let currentSort = 'latest';
let visibleCount = 3;

async function fetchNewDevicesFromDashboard() {
  const response = await fetch('../../api/products?type=new');

  if (!response.ok) {
    throw new Error('Failed to load new devices');
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error('Invalid products response');
  }

  return result.data.map(normalizeProduct);
}

async function loadNewDevices() {
  try {
    const dashboardData = await fetchNewDevicesFromDashboard();

    if (dashboardData.length > 0) {
      pageData = dashboardData;
      usingDemoData = false;
    } else {
      pageData = demoNewDevices;
      usingDemoData = true;
    }
  } catch (error) {
    console.warn('Dashboard unavailable, using demo data:', error);
    pageData = demoNewDevices;
    usingDemoData = true;
  }

  renderNewDevices();
  updateDemoNotice(usingDemoData);
}

function getVisibleNewDevices() {
  const filtered = pageData.filter((item) => {
    if (!catalogMatchesFacets(item)) return false;
    if (!catalogMatchesSearch(item)) return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeBrand !== 'all' && item.brand !== activeBrand) return false;
    return true;
  });

  return sortProductsList(filtered, currentSort);
}

function renderNewDevices() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const visible = getVisibleNewDevices();
  const sliced = visible.slice(0, visibleCount);

  setPageCopy('new_devices_page_title', 'new_devices_page_desc');
  updateSortSelectLabels();
  renderCatalogFilters({
    products: pageData,
    categories: uniqueValues(pageData, 'category'),
    brands: uniqueValues(pageData, 'brand'),
    activeCategory,
    activeBrand
  });
  bindCatalogFilters((next) => {
    if (next.category) activeCategory = next.category;
    if (next.brand) activeBrand = next.brand;
    visibleCount = 3;
    renderNewDevices();
  });

  grid.innerHTML = sliced.map((product) => renderProductCard(product)).join('');
  updateCatalogSummary(pageData.length, visible.length, sliced.length, [activeCategory, activeBrand]);
  updateLoadMoreButton(sliced.length, visible.length);
  bindProductActions(pageData);
}

function sortProducts(sortType) {
  currentSort = sortType;
  renderNewDevices();
}

onStorefrontReady(() => {
  document.getElementById('catalog-search').addEventListener('input', () => { visibleCount = 3; renderNewDevices(); });
  loadNewDevices();

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortProducts(sortSelect.value);
    });
  }

  const loadMore = document.getElementById('load-more-button');
  if (loadMore) {
    loadMore.addEventListener('click', () => {
      visibleCount += 3;
      renderNewDevices();
    });
  }
});

window.addEventListener('languageChanged', () => {
  if (typeof renderNewDevices === 'function') {
    renderNewDevices();
    updateDemoNotice(usingDemoData);
  }
});
