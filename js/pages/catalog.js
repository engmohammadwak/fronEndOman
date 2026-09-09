const mockDatabase = STOREFRONT_DEMO_PRODUCTS;

const catalogState = {
  query: '',
  category: 'all',
  condition: 'all',
  brands: [],
  storage: [],
  sort: 'latest',
  view: 'grid'
};

let allProducts = [];
let usingDemoData = true;

function catalogListingType(item) {
  return item.listingType === 'refurbished' ? 'refurbished' : 'new';
}

function readCatalogParams() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || params.get('search') || '';
  const category = params.get('cat') || params.get('category') || 'all';
  const condition = params.get('condition') || 'all';
  return { query, category, condition };
}

function syncCatalogUrl() {
  const url = new URL(window.location.href);
  const next = new URLSearchParams();
  if (catalogState.query) next.set('q', catalogState.query);
  if (catalogState.category && catalogState.category !== 'all') next.set('cat', catalogState.category);
  if (catalogState.condition && catalogState.condition !== 'all') next.set('condition', catalogState.condition);
  const search = next.toString();
  const nextUrl = `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
  if (`${url.pathname}${url.search}${url.hash}` !== nextUrl) {
    history.replaceState({}, '', nextUrl);
  }
}

function syncSearchInputs() {
  const pageSearch = document.getElementById('catalog-search');
  const headerSearch = document.getElementById('header-search-input');
  const headerCategory = document.getElementById('header-category-select');
  if (pageSearch && pageSearch.value !== catalogState.query) pageSearch.value = catalogState.query;
  if (headerSearch) headerSearch.value = catalogState.query;
  if (headerCategory && ['all', 'phones', 'laptops', 'accessories'].includes(catalogState.category)) {
    headerCategory.value = catalogState.category;
  }
}

function productMatchesCatalogFilters(item, options) {
  const ignoreCondition = options && options.ignoreCondition;
  if (!matchesSearchQuery(item, catalogState.query)) return false;
  if (catalogState.category !== 'all' && item.category !== catalogState.category) return false;
  if (!ignoreCondition && catalogState.condition !== 'all' && catalogListingType(item) !== catalogState.condition) return false;
  if (catalogState.brands.length && !catalogState.brands.includes(item.brand)) return false;
  if (catalogState.storage.length && !catalogState.storage.includes(catalogStorageValue(item))) return false;
  return true;
}

function getVisibleCatalogProducts() {
  return sortProductsList(allProducts.filter((item) => productMatchesCatalogFilters(item)), catalogState.sort);
}

function updateCatalogHeading() {
  const title = document.getElementById('page-title');
  const description = document.getElementById('page-description');
  if (!title || !description) return;

  if (catalogState.query) {
    title.textContent = `${storefrontText('catalog_results_title', catalogCopy('نتائج البحث', 'Search results'))}: ${catalogState.query}`;
    description.textContent = catalogCopy(
      `عرض الأجهزة المطابقة لـ «${catalogState.query}».`,
      `Showing devices matching “${catalogState.query}”.`
    );
    return;
  }

  title.textContent = storefrontText('catalog_page_title', catalogCopy('كتالوج الأجهزة', 'Device Catalog'));
  description.textContent = storefrontText('catalog_page_desc', catalogCopy(
    'ابحث في كل الأجهزة الجديدة والمجددة من مكان واحد.',
    'Search every new and refurbished device in one place.'
  ));
}

function renderConditionTabs() {
  const container = document.getElementById('condition-tabs');
  if (!container) return;

  const base = allProducts.filter((item) => productMatchesCatalogFilters(item, { ignoreCondition: true }));
  const tabs = [
    { value: 'all', label: storefrontText('catalog_tab_all', catalogCopy('الكل', 'All')), count: base.length },
    { value: 'new', label: storefrontText('catalog_tab_new', catalogCopy('جديدة بضمان الوكيل', 'New with warranty')), count: base.filter((item) => catalogListingType(item) === 'new').length },
    { value: 'refurbished', label: storefrontText('catalog_tab_refurb', catalogCopy('مجددة فحص 40 نقطة', 'Certified refurbished')), count: base.filter((item) => catalogListingType(item) === 'refurbished').length }
  ];

  container.innerHTML = tabs.map((tab) => `
    <button type="button" class="catalog-tab" data-condition="${tab.value}" aria-selected="${catalogState.condition === tab.value}">
      <span>${escapeHtml(tab.label)}</span>
      <span class="catalog-tab-count">${tab.count}</span>
    </button>
  `).join('');

  container.querySelectorAll('[data-condition]').forEach((button) => {
    button.addEventListener('click', () => {
      catalogState.condition = button.dataset.condition;
      renderCatalogPage();
    });
  });
}

function renderCatalogSidebar() {
  const container = document.getElementById('filters-container');
  if (!container) return;

  const categories = uniqueValues(allProducts, 'category');
  const brands = uniqueValues(allProducts, 'brand');
  const storages = [...new Set(allProducts.map(catalogStorageValue).filter(Boolean))]
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  container.innerHTML = `
    <div class="catalog-filter-panel flex flex-col gap-5 text-sm">
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/10">
        <div class="flex items-center gap-2 font-black text-on-surface">
          <span class="material-symbols-outlined text-primary text-lg" aria-hidden="true">tune</span>
          ${catalogCopy('تصفية', 'Filters')}
        </div>
        <button id="reset-filters" type="button" class="text-error text-xs font-bold bg-transparent border-none cursor-pointer hover:underline">
          ${catalogCopy('إعادة ضبط', 'Reset')}
        </button>
      </div>

      <fieldset class="flex flex-col gap-2">
        <legend class="font-bold mb-1 text-on-surface">${escapeHtml(storefrontText('catalog_device_type', catalogCopy('نوع الجهاز', 'Device type')))}</legend>
        ${categories.map((category) => `
          <label class="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 hover:bg-surface-container-low cursor-pointer">
            <span class="flex items-center gap-2">
              <input type="checkbox" name="catalog-category" value="${escapeHtml(category)}" ${catalogState.category === category ? 'checked' : ''} class="accent-primary w-4 h-4 cursor-pointer">
              <span class="font-semibold text-on-surface text-xs">${escapeHtml(storefrontText(`cat_${category}`, category))}</span>
            </span>
          </label>
        `).join('')}
      </fieldset>

      <fieldset>
        <legend class="font-bold mb-2 text-on-surface">${escapeHtml(storefrontText('catalog_brands', catalogCopy('الماركة', 'Brand')))}</legend>
        <div class="flex flex-wrap gap-1.5">
          ${brands.map((brand) => `
            <button type="button" data-brand="${escapeHtml(brand)}" aria-pressed="${catalogState.brands.includes(brand)}" class="brand-filter px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer ${catalogState.brands.includes(brand) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-secondary'}">${escapeHtml(brand)}</button>
          `).join('')}
        </div>
      </fieldset>

      <fieldset>
        <legend class="font-bold mb-2 text-on-surface">${catalogCopy('التخزين', 'Storage')}</legend>
        <div class="grid grid-cols-2 gap-1.5">
          ${storages.map((value) => `
            <button type="button" data-storage="${value}" aria-pressed="${catalogState.storage.includes(value)}" class="storage-filter py-2 rounded-lg text-xs font-bold cursor-pointer border-none ${catalogState.storage.includes(value) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-secondary'}">${value}</button>
          `).join('')}
        </div>
      </fieldset>
    </div>
  `;

  container.querySelectorAll('input[name="catalog-category"]').forEach((input) => {
    input.addEventListener('change', () => {
      catalogState.category = input.checked ? input.value : 'all';
      renderCatalogPage();
    });
  });

  container.querySelectorAll('.brand-filter, .storage-filter').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.brand ? 'brands' : 'storage';
      const value = button.dataset.brand || button.dataset.storage;
      const selected = catalogState[key].includes(value);
      catalogState[key] = selected
        ? catalogState[key].filter((item) => item !== value)
        : catalogState[key].concat(value);
      renderCatalogPage();
    });
  });

  document.getElementById('reset-filters')?.addEventListener('click', resetCatalogSearch);
}

function renderCatalogListCard(product) {
  const refurbished = catalogListingType(product) === 'refurbished';
  const name = getLocalizedValue(product, 'name');
  const currency = catalogCopy(product.currencyAr || 'ر.ع.', product.currencyEn || 'OMR');
  const extra = getLocalizedValue(product, 'extra');
  const badge = refurbished
    ? (getLocalizedValue(product, 'condition') || catalogCopy('مجدد', 'Refurbished'))
    : (product.oldPrice
      ? (catalogCopy(product.badgeAr, product.badgeEn) || catalogCopy('عرض', 'Sale'))
      : catalogCopy('جديد', 'New'));

  return `
    <article class="catalog-card-list">
      <a class="catalog-card-link catalog-media" href="${escapeHtml(getProductPageUrl(product.id))}">
        <img class="w-full h-full object-contain p-2" loading="lazy" alt="${escapeHtml(name)}" src="${escapeHtml(safeMediaUrl(product.image, STOREFRONT_PLACEHOLDER_IMAGE))}">
      </a>
      <div class="min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <span class="${refurbished ? 'catalog-badge catalog-badge-refurb' : (product.oldPrice ? 'catalog-badge catalog-badge-sale' : 'catalog-badge catalog-badge-new')}">${escapeHtml(badge)}</span>
          <span class="text-xs text-secondary font-bold">${escapeHtml(product.brand)}</span>
        </div>
        <h3 class="font-extrabold text-on-surface leading-relaxed mb-2"><a class="catalog-card-link" href="${escapeHtml(getProductPageUrl(product.id))}">${escapeHtml(name)}</a></h3>
        <div class="flex flex-wrap items-center gap-2 text-xs text-secondary mb-2">
          <span class="inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-sm text-amber-500" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">star</span>
            ${escapeHtml(product.rating)} (${escapeHtml(product.reviews)})
          </span>
          ${extra ? `<span class="catalog-chip">${escapeHtml(extra)}</span>` : ''}
          ${product.battery != null ? `<span class="catalog-chip">${catalogCopy('بطارية', 'Battery')} ${escapeHtml(product.battery)}%</span>` : ''}
          ${product.warrantyMonths != null ? `<span class="catalog-chip">${catalogCopy('ضمان', 'Warranty')} ${escapeHtml(product.warrantyMonths)} ${catalogCopy('أشهر', 'mo')}</span>` : ''}
        </div>
      </div>
      <div class="flex flex-col items-end gap-3 min-w-[8rem]">
        <div class="font-mono text-end">
          <div class="text-lg font-black text-primary leading-none">
            ${Number(product.price).toLocaleString()}
            <span class="text-[11px] font-normal font-sans text-secondary">${escapeHtml(currency)}</span>
          </div>
          ${product.oldPrice ? `<div class="text-[11px] text-secondary line-through font-sans mt-1">${Number(product.oldPrice).toLocaleString()} ${escapeHtml(currency)}</div>` : ''}
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="wishlist-button catalog-wishlist" data-product-id="${escapeHtml(product.id)}" aria-label="${catalogCopy('إضافة للمفضلة', 'Add to wishlist')}">
            <span class="material-symbols-outlined text-base" aria-hidden="true">favorite</span>
          </button>
          <button type="button" data-product-id="${escapeHtml(product.id)}" class="add-cart-button inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-tertiary-container hover:bg-tertiary text-on-tertiary font-bold cursor-pointer font-sans border-none text-xs" ${Number(product.stock) <= 0 ? 'disabled' : ''}>
            <span class="material-symbols-outlined text-sm" aria-hidden="true">shopping_cart</span>
            ${Number(product.stock) <= 0 ? catalogCopy('نفد', 'Out') : catalogCopy('إضافة', 'Add')}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderCatalogEmpty() {
  const empty = document.getElementById('catalog-empty');
  const grid = document.getElementById('products-grid');
  if (!empty || !grid) return;

  empty.hidden = false;
  empty.innerHTML = `
    <span class="material-symbols-outlined text-4xl text-outline mb-3" aria-hidden="true">search_off</span>
    <h2 class="text-xl font-black text-on-surface mb-2">${escapeHtml(storefrontText('catalog_empty_title', catalogCopy('لم نتمكن من العثور على أجهزة مطابقة لبحثك', 'We could not find devices matching your search')))}</h2>
    <p class="text-secondary text-sm mb-5">${escapeHtml(storefrontText('catalog_empty_desc', catalogCopy('جرّب كلمة أخرى، أو أعد ضبط الفلاتر لعرض الكتالوج كاملاً.', 'Try another keyword, or reset the filters to view the full catalog.')))}</p>
    <button id="reset-catalog-search" type="button" class="catalog-load-more">${escapeHtml(storefrontText('catalog_empty_reset', catalogCopy('إعادة ضبط البحث', 'Reset search')))}</button>
  `;
  document.getElementById('reset-catalog-search')?.addEventListener('click', resetCatalogSearch);
}

function hideCatalogEmpty() {
  const empty = document.getElementById('catalog-empty');
  if (!empty) return;
  empty.hidden = true;
  empty.innerHTML = '';
}

function updateCatalogChips(visible) {
  const chipsEl = document.getElementById('applied-filters');
  const countEl = document.getElementById('products-count');
  const totalEl = document.getElementById('catalog-total');
  const labels = [];

  if (catalogState.query) labels.push(catalogState.query);
  if (catalogState.category !== 'all') labels.push(storefrontText(`cat_${catalogState.category}`, catalogState.category));
  if (catalogState.condition === 'new') labels.push(storefrontText('catalog_switch_new', 'جديد'));
  if (catalogState.condition === 'refurbished') labels.push(storefrontText('catalog_switch_refurb', 'مجدد'));
  labels.push(...catalogState.brands, ...catalogState.storage);

  if (chipsEl) {
    chipsEl.innerHTML = labels.length
      ? labels.map((value) => `<span class="catalog-chip">${escapeHtml(value)}</span>`).join('')
      : `<span class="text-secondary text-xs">${catalogCopy('كل النتائج', 'All results')}</span>`;
  }
  if (countEl) {
    countEl.textContent = catalogCopy(`عرض ${visible.length} جهاز`, `Showing ${visible.length} devices`);
  }
  if (totalEl) {
    totalEl.textContent = catalogCopy(`${allProducts.length} أجهزة`, `${allProducts.length} devices`);
  }
}

function updateCatalogViewButtons() {
  const gridButton = document.getElementById('view-grid');
  const listButton = document.getElementById('view-list');
  if (gridButton) {
    gridButton.setAttribute('aria-pressed', String(catalogState.view === 'grid'));
    gridButton.setAttribute('aria-label', storefrontText('catalog_view_grid', 'Grid view'));
  }
  if (listButton) {
    listButton.setAttribute('aria-pressed', String(catalogState.view === 'list'));
    listButton.setAttribute('aria-label', storefrontText('catalog_view_list', 'List view'));
  }
}

function renderCatalogPage() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  syncSearchInputs();
  syncCatalogUrl();
  updateCatalogHeading();
  updateSortSelectLabels();
  renderConditionTabs();
  renderCatalogSidebar();
  updateCatalogViewButtons();
  updateDemoNotice(usingDemoData);

  const visible = getVisibleCatalogProducts();
  updateCatalogChips(visible);

  grid.classList.toggle('is-list', catalogState.view === 'list');
  grid.classList.toggle('grid', catalogState.view !== 'list');

  if (!visible.length) {
    grid.innerHTML = '';
    renderCatalogEmpty();
    return;
  }

  hideCatalogEmpty();
  grid.innerHTML = visible.map((product) => (
    catalogState.view === 'list'
      ? renderCatalogListCard(product)
      : renderDeviceCard(product, catalogListingType(product) === 'refurbished' ? 'refurbished' : '')
  )).join('');
  bindProductActions(allProducts);
}

function resetCatalogSearch() {
  catalogState.query = '';
  catalogState.category = 'all';
  catalogState.condition = 'all';
  catalogState.brands = [];
  catalogState.storage = [];
  renderCatalogPage();
}

function applyCatalogQuery(next) {
  if (!next) return;
  if (typeof next.q === 'string') catalogState.query = next.q.trim();
  if (typeof next.search === 'string') catalogState.query = next.search.trim();
  if (next.cat || next.category) catalogState.category = next.cat || next.category || 'all';
  if (next.condition) catalogState.condition = next.condition;
  renderCatalogPage();
}

function hydrateCatalogFromUrl() {
  const params = readCatalogParams();
  catalogState.query = params.query;
  catalogState.category = params.category || 'all';
  catalogState.condition = ['new', 'refurbished', 'all'].includes(params.condition) ? params.condition : 'all';
}

async function loadCatalogProducts() {
  try {
    allProducts = apiList(await requestApi('catalog/products')).map(normalizeProduct);
    usingDemoData = false;
    return;
  } catch (error) {
    if (!isDemoMode()) { allProducts = []; usingDemoData = false; showApiError(); return; }
  }

  allProducts = hydrateLiveCatalog(mockDatabase.map((item) => ({
    currencyAr: 'ر.ع.',
    currencyEn: 'OMR',
    oldPrice: null,
    ...item
  })));
  usingDemoData = true;
}

function bindCatalogPageControls() {
  const search = document.getElementById('catalog-search');
  const sortSelect = document.getElementById('sort-select');
  const gridButton = document.getElementById('view-grid');
  const listButton = document.getElementById('view-list');

  search?.addEventListener('input', () => {
    catalogState.query = search.value.trim();
    renderCatalogPage();
  });

  sortSelect?.addEventListener('change', () => {
    catalogState.sort = sortSelect.value;
    renderCatalogPage();
  });

  gridButton?.addEventListener('click', () => {
    catalogState.view = 'grid';
    renderCatalogPage();
  });

  listButton?.addEventListener('click', () => {
    catalogState.view = 'list';
    renderCatalogPage();
  });
}

window.applyCatalogQuery = applyCatalogQuery;

onStorefrontReady(async () => {
  hydrateCatalogFromUrl();
  bindCatalogPageControls();
  await loadCatalogProducts();
  renderCatalogPage();
});

document.addEventListener('componentsLoaded', () => {
  syncSearchInputs();
});

window.addEventListener('languageChanged', () => {
  if (allProducts.length) renderCatalogPage();
});
