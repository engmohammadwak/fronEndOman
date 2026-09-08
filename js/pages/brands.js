const demoBrands = [
  {
    id: 1,
    name: 'Apple',
    nameAr: 'آبل',
    nameEn: 'Apple',
    logo: '../../assets/brands/apple.svg',
    productCount: 24,
    isDemo: true
  },
  {
    id: 2,
    name: 'Samsung',
    nameAr: 'سامسونج',
    nameEn: 'Samsung',
    logo: '../../assets/brands/samsung.svg',
    productCount: 18,
    isDemo: true
  },
  {
    id: 3,
    name: 'Sony',
    nameAr: 'سوني',
    nameEn: 'Sony',
    logo: '../../assets/brands/sony.svg',
    productCount: 12,
    isDemo: true
  },
  {
    id: 4,
    name: 'Dell',
    nameAr: 'ديل',
    nameEn: 'Dell',
    logo: '../../assets/brands/dell.svg',
    productCount: 9,
    isDemo: true
  },
  {
    id: 5,
    name: 'Microsoft',
    nameAr: 'مايكروسوفت',
    nameEn: 'Microsoft',
    logo: '../../assets/brands/microsoft.svg',
    productCount: 7,
    isDemo: true
  },
  {
    id: 6,
    name: 'Huawei',
    nameAr: 'هواوي',
    nameEn: 'Huawei',
    logo: '../../assets/brands/huawei.svg',
    productCount: 11,
    isDemo: true
  }
];

let pageData = [];
let usingDemoData = true;

async function fetchBrandsFromDashboard() {
  const response = await fetch('../../api/brands');

  if (!response.ok) {
    throw new Error('Failed to load brands');
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error('Invalid brands response');
  }

  return result.data.map(normalizeBrand);
}

async function loadBrands() {
  try {
    const dashboardData = await fetchBrandsFromDashboard();

    if (dashboardData.length > 0) {
      pageData = dashboardData;
      usingDemoData = false;
    } else {
      pageData = demoBrands;
      usingDemoData = true;
    }
  } catch (error) {
    console.warn('Dashboard unavailable, using demo data:', error);
    pageData = demoBrands;
    usingDemoData = true;
  }

  renderBrands();
  updateDemoNotice(usingDemoData);
}

function renderBrandCard(brand) {
  const name = getLocalizedValue(brand, 'name') || brand.name;
  const countLabel = storefrontText('brand_products', getCurrentLanguage() === 'en' ? '{count} products' : '{count} منتج')
    .replace('{count}', String(brand.productCount || 0));

  return `
    <a
      href="./new-devices.html"
      class="flex flex-col items-center justify-center gap-3 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all min-h-[200px]"
    >
      <div class="w-20 h-20 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex items-center justify-center p-3">
        <img src="${escapeHtml(safeMediaUrl(brand.logo, STOREFRONT_PLACEHOLDER_IMAGE))}" alt="${escapeHtml(name)}" class="w-full h-full object-contain">
      </div>
      <h2 class="text-lg font-black text-on-surface">${escapeHtml(name)}</h2>
      <p class="text-sm text-secondary">${escapeHtml(countLabel)}</p>
    </a>
  `;
}

function renderBrands() {
  const grid = document.getElementById('brands-grid');
  if (!grid) return;

  setPageCopy('brands_page_title', 'brands_page_desc');
  grid.innerHTML = pageData.map((brand) => renderBrandCard(brand)).join('');
}

onStorefrontReady(() => {
  loadBrands();
});

window.addEventListener('languageChanged', () => {
  if (typeof renderBrands === 'function') {
    renderBrands();
    updateDemoNotice(usingDemoData);
  }
});
