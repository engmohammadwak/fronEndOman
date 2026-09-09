const demoRefurbishedDevices = [
  {
    id: 101,
    nameAr: 'آيفون 14 برو ماكس 256 جيجابايت - بنفسجي عميق (مجدد معتمد)',
    nameEn: 'iPhone 14 Pro Max 256GB - Deep Purple (Certified Refurbished)',
    brand: 'Apple',
    category: 'phones',
    price: 3250,
    oldPrice: 4800,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.8,
    reviews: 86,
    stock: 7,
    badgeAr: 'مجدد',
    badgeEn: 'Refurbished',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJQ7Kbf_imzAYLBmlN6sahHsItdRNAm-hIWBsrJ28teww7-sc1P7-z_A28E_0hZBhKFHFlTcMcR4KXGQ-Q8mi8KGh00QA1Mg01O5ZyM6ApKto4x9OJbiBFEnRXFqRfpdXbMcEP_R7ksMWMdK9qlK30bvOSoqZZsd9Ulc91v0fhTaN7qaVdmuoUZxDf0_r5WqKN0FJNBlAFnQCigogzNUgu3YNyFtw7yEogvIV-aVUPYC2ddGeDTHnncA',
    conditionAr: 'كالجديد A+',
    conditionEn: 'Like New A+',
    battery: 95,
    warrantyMonths: 6,
    extraAr: '256GB',
    extraEn: '256GB',
    storageGb: 256,
    isDemo: true
  },
  {
    id: 102,
    nameAr: 'لابتوب ديل XPS 13 إنتل كور i7 - شاشة 4K لمسية مجدد',
    nameEn: 'Dell XPS 13 Intel Core i7 - 4K Touchscreen Refurbished',
    brand: 'Dell',
    category: 'laptops',
    price: 3100,
    oldPrice: 4650,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.6,
    reviews: 54,
    stock: 5,
    badgeAr: 'مجدد',
    badgeEn: 'Refurbished',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA--HJe7mBe3EOE08JDf-Hzxw8EL7jTGhbYXcYprzUHE5OUPBtvmm3S3y8wxNaboqfNfuF_Ke-Vr_SWk5MZThaCOY-3WBMb7Fwcf3IFp-ZbmNLNW8w0wsKOgDDEMoqB3P0G1vhciuYwNvE6CGQ35l5HL3IQ9oWeHnS-iOKGXnysI2IfkF_tPcdvRUfcIbpBRJ0QRnKw1JNT2tJwRoay-itRbYhxyXmXdHh0yO34_5vLjezxI3ZjBYsSA',
    conditionAr: 'ممتاز A',
    conditionEn: 'Excellent A',
    battery: 100,
    warrantyMonths: 6,
    extraAr: '512GB • مع العلبة الأصلية',
    extraEn: '512GB • With original box',
    storageGb: 512,
    isDemo: true
  },
  {
    id: 103,
    nameAr: 'آيباد برو 11 إنش شريحة M2 مساحة 128GB مع قلم ذكي',
    nameEn: 'iPad Pro 11-inch M2 Chip 128GB with Smart Pen',
    brand: 'Apple',
    category: 'tablets',
    price: 2400,
    oldPrice: 3499,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.7,
    reviews: 41,
    stock: 9,
    badgeAr: 'مجدد',
    badgeEn: 'Refurbished',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuug7nrwpbjW9TJEUPTL_jwva09AIuB_tbXAD0y8F6DXhNO5tq2li2J-0q_xf1a1R2m2xC7kJqsR54tGznw41P9ui9xh2dMKLKdxcDgytt_QYXtRIuhJCw29fyiozs7EqyDift7rLTyJlZXJKmjdnkzCTQDLGPMjqu9noBn9-Rza6VUFrUrI0FPpi39r0koYBy8k8dg3IxwrNJYr7u1unnWv6pmZ2siEhn968H6IiWHmgr20C18_BiAA',
    conditionAr: 'جيد جداً B+',
    conditionEn: 'Very Good B+',
    battery: 91,
    warrantyMonths: 6,
    extraAr: '128GB + قلم آبل هدية',
    extraEn: '128GB + Free Apple Pencil',
    storageGb: 128,
    isDemo: true
  },
  {
    id: 104,
    nameAr: 'بلايستيشن 5 نسخة الأقراص مستعمل ومفحوص مع يدين تحكم',
    nameEn: 'PlayStation 5 Disc Edition Used & Tested with 2 Controllers',
    brand: 'Sony',
    category: 'gaming',
    price: 1650,
    oldPrice: 2399,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.9,
    reviews: 118,
    stock: 4,
    badgeAr: 'مجدد',
    badgeEn: 'Refurbished',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClWgdZfjowMmVXTkpG_zgThPd-9AESWBaXozrWzWa95TlWnvT_8NA2NJMvtzpvrMF539ii4yAq2IJFeK5E1toqtFI_L93Fd-Ht_ib76UorNuyCH0iz13zb9lQ_Ms8Xq6ukGe6PB71575elh1u92C00CNTGmENyGbfI3tbsT4LJFCzo9om-r7WdEUXgwvVyW9mi-xf_JcpvLHYem5q3dIDJ578S7OOfGgBQ2LnOJ_UM8mxevN89d4mFBA',
    conditionAr: 'كالجديد A+',
    conditionEn: 'Like New A+',
    battery: null,
    warrantyMonths: 6,
    extraAr: 'مع يدين تحكم',
    extraEn: 'With 2 controllers',
    isDemo: true
  },
  {
    id: 105,
    nameAr: 'سامسونج جالاكسي Z فليب 5 مجدد معتمد',
    nameEn: 'Samsung Galaxy Z Flip 5 Certified Refurbished',
    brand: 'Samsung',
    category: 'phones',
    price: 2199,
    oldPrice: 3299,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.5,
    reviews: 33,
    stock: 6,
    badgeAr: 'مجدد',
    badgeEn: 'Refurbished',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrXhTZzxQaZQ12T5RrDjuRWDRD4R34bXFZWDUBIi8e5dl-dfVlxGGHFxRpBplBgkcV7hbfwew6MQtHZ296EKERLyhqUaF1h2Z-yJO7e45Hzk_B035n7QLWTbo0to_LwH7BWideoo100mA09lD62io9apBoRgpj4gWsgOtbpLDpuf-VVHvVC_RUmamlJrRQjcpqee6DYqZJLN4DcmRqfkzqcEwHy-5X7olvpTj22Z__Ix4FF1Q78ZIEyQ',
    conditionAr: 'ممتاز A',
    conditionEn: 'Excellent A',
    battery: 93,
    warrantyMonths: 6,
    extraAr: '256GB • فحص 40 نقطة',
    extraEn: '256GB • 40-point inspection',
    storageGb: 256,
    isDemo: true
  },
  {
    id: 106,
    nameAr: 'مايكروسوفت سيرفس لابتوب 5 مجدد',
    nameEn: 'Microsoft Surface Laptop 5 Refurbished',
    brand: 'Microsoft',
    category: 'laptops',
    price: 2890,
    oldPrice: 3999,
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    rating: 4.4,
    reviews: 27,
    stock: 3,
    badgeAr: 'مجدد',
    badgeEn: 'Refurbished',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdELpABShIn9MFz2KGO9TD_IKASHQVGbZmD2FfGbWLNMUHxLzFp88ZcpH5zQ0Tmw3EXcdCw36S83tHdv6MqW6VuknyQfaNL4Swypn0JqT3yw0R9hHPDtXQS0tA8pMjzlRnLzFVSSUnr8ukingYgVnJcCkLALieh_-E8__9F7hhS0gEIcGZWLJPxElkQr2Qz_Rz6f_vtQ2f4e4Z6glTZCzhKyK__X_62dMSpYHBMLUFZszTMvI2TV8msw',
    conditionAr: 'جيد جداً B+',
    conditionEn: 'Very Good B+',
    battery: 88,
    warrantyMonths: 6,
    extraAr: 'i7 • 16GB • 512GB',
    extraEn: 'i7 • 16GB • 512GB',
    storageGb: 512,
    isDemo: true
  }
];

let pageData = [];
let usingDemoData = true;
let activeCategory = 'all';
let activeBrand = 'all';
let activeCondition = 'all';
let currentSort = 'latest';
let visibleCount = 3;

async function fetchRefurbishedDevicesFromDashboard() {
  const result = await requestApi('products?type=refurbished');

  if (!Array.isArray(result.data)) {
    throw new Error('Invalid products response');
  }

  return result.data.map(normalizeProduct);
}

async function loadRefurbishedDevices() {
  try {
    const dashboardData = await fetchRefurbishedDevicesFromDashboard();

    if (Array.isArray(dashboardData)) {
      pageData = dashboardData;
      usingDemoData = false;
    } else {
      pageData = demoRefurbishedDevices;
      usingDemoData = true;
    }
  } catch (error) {
    if (!isDemoMode()) { pageData = []; usingDemoData = false; showApiError(); return; }

    pageData = demoRefurbishedDevices;
    usingDemoData = true;
  }

  if (typeof applyLiveStock === 'function') pageData = applyLiveStock(pageData);
  renderRefurbishedDevices();
  updateDemoNotice(usingDemoData);
}

function getConditionOptions() {
  const seen = new Map();
  pageData.forEach((item) => {
    const value = item.conditionEn || item.conditionAr;
    if (!value || seen.has(value)) return;
    seen.set(value, {
      value,
      labelAr: item.conditionAr || item.conditionEn,
      labelEn: item.conditionEn || item.conditionAr
    });
  });
  return [...seen.values()];
}

function getVisibleRefurbishedDevices() {
  const filtered = pageData.filter((item) => {
    if (!catalogMatchesFacets(item)) return false;
    if (!catalogMatchesSearch(item)) return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeBrand !== 'all' && item.brand !== activeBrand) return false;
    if (activeCondition !== 'all' && (item.conditionEn || item.conditionAr) !== activeCondition) return false;
    return true;
  });

  return sortProductsList(filtered, currentSort);
}

function renderRefurbishedDevices() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const visible = getVisibleRefurbishedDevices();
  const sliced = visible.slice(0, visibleCount);

  setPageCopy('refurbished_page_title', 'refurbished_page_desc');
  updateSortSelectLabels();
  renderDeviceFilters({
    products: pageData,
    categories: uniqueValues(pageData, 'category'),
    brands: uniqueValues(pageData, 'brand'),
    conditions: getConditionOptions(),
    activeCategory,
    activeBrand,
    activeCondition
  });
  bindDeviceFilters((next) => {
    if (next.category) activeCategory = next.category;
    if (next.brand) activeBrand = next.brand;
    if (next.condition) activeCondition = next.condition;
    visibleCount = 3;
    renderRefurbishedDevices();
  });

  grid.innerHTML = sliced.map((product) => renderDeviceCard(product, 'refurbished')).join('');
  updateCatalogSummary(pageData.length, visible.length, sliced.length, [activeCategory, activeBrand, activeCondition]);
  updateLoadMoreButton(sliced.length, visible.length);
  bindProductActions(pageData);
}

function sortProducts(sortType) {
  currentSort = sortType;
  renderRefurbishedDevices();
}

onStorefrontReady(() => {
  document.getElementById('catalog-search').addEventListener('input', () => { visibleCount = 3; renderRefurbishedDevices(); });
  loadRefurbishedDevices();

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
      renderRefurbishedDevices();
    });
  }
});

window.addEventListener('languageChanged', () => {
  if (typeof renderRefurbishedDevices === 'function') {
    renderRefurbishedDevices();
    updateDemoNotice(usingDemoData);
  }
});
