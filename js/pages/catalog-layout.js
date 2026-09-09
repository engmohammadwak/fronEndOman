// Presentation shared only by the two catalog pages.
Object.assign(translations.ar, {
  catalog_search: 'ابحث بالاسم أو الماركة أو السعة...',
  catalog_sort: 'الترتيب',
  catalog_electronics: 'الأجهزة الإلكترونية',
  catalog_brands: 'الماركة'
});
Object.assign(translations.en, {
  catalog_search: 'Search by name, brand, or storage...',
  catalog_sort: 'Sort',
  catalog_electronics: 'Electronics',
  catalog_brands: 'Brand'
});

function catalogCopy(ar, en) {
  return getCurrentLanguage() === 'en' ? en : ar;
}

function normalizeSearchText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function productSearchHaystack(item) {
  const brandKey = String(item.brand || '').toLowerCase();
  const brandAliases = {
    apple: 'apple ابل',
    samsung: 'samsung سامسونج',
    sony: 'sony سوني',
    dell: 'dell ديل',
    microsoft: 'microsoft مايكروسوفت',
    lenovo: 'lenovo لينوفو'
  };

  return normalizeSearchText([
    item.nameAr,
    item.nameEn,
    item.name,
    item.brand,
    item.brandAr,
    item.brandEn,
    item.category,
    item.extraAr,
    item.extraEn,
    item.storage,
    item.storageGb != null ? `${item.storageGb}gb` : '',
    item.conditionAr,
    item.conditionEn,
    item.badgeAr,
    item.badgeEn,
    item.keywords,
    item.specs,
    item.model,
    brandAliases[brandKey] || ''
  ].flat().filter(Boolean).join(' '));
}

function fuzzySearchIncludes(haystack, token) {
  if (!token) return true;
  if (haystack.includes(token)) return true;
  const stem = token.replace(/[هةت]$/, '');
  if (stem.length < 3) return false;
  if (haystack.includes(stem)) return true;
  return haystack.split(' ').some((word) => word.startsWith(stem) || (word.length >= 3 && stem.startsWith(word)));
}

function matchesSearchQuery(item, query) {
  const tokens = normalizeSearchText(query).split(' ').filter(Boolean);
  if (!tokens.length) return true;
  const haystack = productSearchHaystack(item);
  return tokens.every((token) => fuzzySearchIncludes(haystack, token));
}

function catalogMatchesSearch(item) {
  const field = document.getElementById('catalog-search');
  return matchesSearchQuery(item, field ? field.value : '');
}

let catalogConditions = null;
let catalogStorage = [];
let catalogSelectedBrands = [];
let catalogSelectedCategories = [];
let catalogFacets = [];

function catalogCondition(item) {
  return item.conditionEn || item.conditionAr || 'new';
}

function catalogStorageValue(item) {
  const explicit = item.storageGb;
  if (explicit != null && Number(explicit) > 0) return `${Number(explicit)}GB`;
  const match = [item.extraEn, item.extraAr, item.nameEn, item.nameAr].join(' ').match(/(\d+)\s*(GB|TB)/i);
  return match ? `${Number(match[1]) * (match[2].toUpperCase() === 'TB' ? 1024 : 1)}GB` : '';
}

function catalogMatchesFacets(item) {
  return (catalogConditions === null || catalogConditions.includes(catalogCondition(item)))
    && (!catalogStorage.length || catalogStorage.includes(catalogStorageValue(item)))
    && (!catalogSelectedBrands.length || catalogSelectedBrands.includes(item.brand))
    && (!catalogSelectedCategories.length || catalogSelectedCategories.includes(item.category));
}

function updateCatalogSummary(total, filtered, shown) {
  const totalEl = document.getElementById('catalog-total');
  const countEl = document.getElementById('products-count');
  const chipsEl = document.getElementById('applied-filters');

  if (totalEl) totalEl.textContent = catalogCopy(`${total} أجهزة`, `${total} devices`);
  if (countEl) {
    countEl.textContent = catalogCopy(
      `عرض ${shown} من ${filtered}`,
      `Showing ${shown} of ${filtered}`
    );
  }

  const labels = [];
  if (catalogSelectedCategories.length) {
    labels.push(...catalogSelectedCategories.map((value) => storefrontText(`cat_${value}`, value)));
  }
  if (catalogSelectedBrands.length) labels.push(...catalogSelectedBrands);
  if (catalogConditions !== null) {
    labels.push(...catalogFacets.filter((item) => catalogConditions.includes(item.value)).map((item) => item.label));
  }
  labels.push(...catalogStorage);
  const query = document.getElementById('catalog-search')?.value.trim();
  if (query) labels.push(query);

  if (chipsEl) {
    chipsEl.innerHTML = labels.length
      ? labels.map((value) => `<span class="catalog-chip">${escapeHtml(value)}</span>`).join('')
      : `<span class="text-secondary text-xs">${catalogCopy('كل النتائج', 'All results')}</span>`;
  }

  if (!filtered) {
    document.getElementById('products-grid').innerHTML = `
      <div class="col-span-full rounded-2xl border border-dashed border-outline-variant/30 bg-white p-10 text-center">
        <span class="material-symbols-outlined text-3xl text-outline mb-2" aria-hidden="true">search_off</span>
        <p class="font-bold text-on-surface">${catalogCopy('لا توجد أجهزة مطابقة', 'No matching devices')}</p>
        <p class="text-secondary text-sm mt-1">${catalogCopy('جرّب كلمة بحث أخرى أو أعد ضبط الفلاتر.', 'Try another search or reset the filters.')}</p>
      </div>
    `;
  }
}

function renderDeviceFilters(options) {
  const items = options.products || [];
  const conditions = new Map();
  items.forEach((item) => {
    const value = catalogCondition(item);
    if (!conditions.has(value)) {
      conditions.set(value, {
        value,
        count: 0,
        label: value === 'new'
          ? catalogCopy('جديد بالكرتون', 'Brand new')
          : getLocalizedValue(item, 'condition')
      });
    }
    conditions.get(value).count += 1;
  });
  catalogFacets = [...conditions.values()];

  const storages = [...new Set(items.map(catalogStorageValue).filter(Boolean))]
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const brands = options.brands || uniqueValues(items, 'brand');
  const categories = options.categories || uniqueValues(items, 'category');

  document.getElementById('filters-container').innerHTML = `
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
        <legend class="font-bold mb-1 text-on-surface">${catalogCopy('الحالة', 'Condition')}</legend>
        ${catalogFacets.map((item) => `
          <label class="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 hover:bg-surface-container-low cursor-pointer">
            <span class="flex items-center gap-2">
              <input type="checkbox" name="catalog-condition" value="${escapeHtml(item.value)}" ${catalogConditions === null || catalogConditions.includes(item.value) ? 'checked' : ''} class="accent-primary w-4 h-4 cursor-pointer">
              <span class="font-semibold text-on-surface text-xs">${escapeHtml(item.label)}</span>
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${item.value === 'new' ? 'bg-primary/10 text-primary' : 'bg-tertiary-fixed text-on-tertiary-fixed'}">${item.count}</span>
          </label>
        `).join('')}
      </fieldset>

      <fieldset>
        <legend class="font-bold mb-2 text-on-surface">${escapeHtml(storefrontText('filter_category', catalogCopy('الفئة', 'Category')))}</legend>
        <div class="flex flex-wrap gap-1.5">
          ${categories.map((category) => `
            <button type="button" data-category="${escapeHtml(category)}" aria-pressed="${catalogSelectedCategories.includes(category)}" class="category-filter px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer ${catalogSelectedCategories.includes(category) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-secondary'}">${escapeHtml(storefrontText(`cat_${category}`, category))}</button>
          `).join('')}
        </div>
      </fieldset>

      <fieldset>
        <legend class="font-bold mb-2 text-on-surface">${escapeHtml(storefrontText('catalog_brands', catalogCopy('الماركة', 'Brand')))}</legend>
        <div class="flex flex-wrap gap-1.5">
          ${brands.map((brand) => `
            <button type="button" data-brand="${escapeHtml(brand)}" aria-pressed="${catalogSelectedBrands.includes(brand)}" class="brand-filter px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer ${catalogSelectedBrands.includes(brand) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-secondary'}">${escapeHtml(brand)}</button>
          `).join('')}
        </div>
      </fieldset>

      ${storages.length ? `
      <fieldset>
        <legend class="font-bold mb-2 text-on-surface">${catalogCopy('التخزين', 'Storage')}</legend>
        <div class="grid grid-cols-2 gap-1.5">
          ${storages.map((value) => `
            <button type="button" data-storage="${value}" aria-pressed="${catalogStorage.includes(value)}" class="storage-filter py-2 rounded-lg text-xs font-bold cursor-pointer border-none ${catalogStorage.includes(value) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-secondary'}">${value}</button>
          `).join('')}
        </div>
      </fieldset>
      ` : ''}

      <button id="apply-filters" type="button" class="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold border-none cursor-pointer hover:bg-primary-container">
        ${catalogCopy('تطبيق', 'Apply')}
      </button>
    </div>
  `;
}

function bindDeviceFilters(onChange) {
  const toggleChip = (button, onClass, offClass) => {
    const selected = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(selected));
    button.className = button.className
      .replace(onClass, '')
      .replace(offClass, '')
      .trim();
    button.classList.add(...(selected ? onClass : offClass).split(' '));
  };

  document.querySelectorAll('.storage-filter, .brand-filter, .category-filter').forEach((button) => {
    button.addEventListener('click', () => toggleChip(button, 'bg-primary text-on-primary', 'bg-surface-container-low text-secondary'));
  });

  document.getElementById('apply-filters').addEventListener('click', () => {
    const checked = Array.from(document.querySelectorAll('input[name="catalog-condition"]:checked'), (input) => input.value);
    catalogConditions = checked.length === catalogFacets.length ? null : checked;
    catalogStorage = Array.from(document.querySelectorAll('.storage-filter[aria-pressed="true"]'), (button) => button.dataset.storage);
    catalogSelectedBrands = Array.from(document.querySelectorAll('.brand-filter[aria-pressed="true"]'), (button) => button.dataset.brand);
    catalogSelectedCategories = Array.from(document.querySelectorAll('.category-filter[aria-pressed="true"]'), (button) => button.dataset.category);
    onChange({ category: 'all', brand: 'all', condition: 'all' });
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('catalog-search').value = '';
    catalogConditions = null;
    catalogStorage = [];
    catalogSelectedBrands = [];
    catalogSelectedCategories = [];
    onChange({ category: 'all', brand: 'all', condition: 'all' });
  });
}

function renderDeviceCard(product, variant) {
  const refurbished = variant === 'refurbished';
  const name = getLocalizedValue(product, 'name');
  const currency = catalogCopy(product.currencyAr || 'ر.ع.', product.currencyEn || 'OMR');
  const badge = refurbished
    ? (getLocalizedValue(product, 'condition') || catalogCopy('مجدد', 'Refurbished'))
    : (product.oldPrice
      ? (catalogCopy(product.badgeAr, product.badgeEn) || catalogCopy('عرض', 'Sale'))
      : catalogCopy('جديد', 'New'));
  const badgeClass = refurbished
    ? 'catalog-badge catalog-badge-refurb'
    : (product.oldPrice ? 'catalog-badge catalog-badge-sale' : 'catalog-badge catalog-badge-new');
  const saved = product.oldPrice && product.oldPrice > product.price
    ? product.oldPrice - product.price
    : 0;

  return `
    <article class="catalog-card">
      <div class="flex items-center justify-between mb-3">
        <span class="${badgeClass}">${escapeHtml(badge)}</span>
        <button type="button" class="wishlist-button catalog-wishlist" data-product-id="${escapeHtml(product.id)}" aria-label="${catalogCopy('إضافة للمفضلة', 'Add to wishlist')}">
          <span class="material-symbols-outlined text-base" aria-hidden="true">favorite</span>
        </button>
      </div>

      <a class="catalog-card-link" href="${escapeHtml(getProductPageUrl(product.id))}">
        <div class="catalog-media">
          <img class="w-full h-full object-contain p-1.5" loading="lazy" alt="${escapeHtml(name)}" src="${escapeHtml(safeMediaUrl(product.image, STOREFRONT_PLACEHOLDER_IMAGE))}">
        </div>

        <div class="flex items-center gap-1 text-secondary mb-1">
          <span class="material-symbols-outlined text-sm text-amber-500" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">star</span>
          <span class="font-bold text-on-surface text-sm">${escapeHtml(product.rating)}</span>
          <span class="text-[11px]">(${escapeHtml(product.reviews)})</span>
        </div>

        <h3 class="font-extrabold text-on-surface line-clamp-2 min-h-[2.8rem] leading-relaxed mb-2 text-[0.95rem]" title="${escapeHtml(name)}">${escapeHtml(name)}</h3>
      </a>

      <div class="flex items-center gap-1.5 text-tertiary mb-2 text-[11px] font-bold">
        <span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
        <span>${catalogCopy(`متوفر (${product.stock})`, `${product.stock} available`)}</span>
      </div>

      ${refurbished ? `
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${product.battery != null ? `<span class="catalog-chip">${catalogCopy('بطارية', 'Battery')} ${escapeHtml(product.battery)}%</span>` : ''}
          ${product.warrantyMonths != null ? `<span class="catalog-chip">${catalogCopy('ضمان', 'Warranty')} ${escapeHtml(product.warrantyMonths)} ${catalogCopy('أشهر', 'mo')}</span>` : ''}
          ${saved ? `<span class="catalog-chip text-error">${catalogCopy('وفرت', 'Saved')} ${saved.toLocaleString()}</span>` : ''}
        </div>
      ` : ''}

      <div class="mt-auto pt-3 border-t border-outline-variant/10 flex items-end justify-between gap-2">
        <div class="font-mono">
          <div class="text-lg font-black text-primary leading-none">
            ${Number(product.price).toLocaleString()}
            <span class="text-[11px] font-normal font-sans text-secondary">${escapeHtml(currency)}</span>
          </div>
          ${product.oldPrice ? `<div class="text-[11px] text-secondary line-through font-sans mt-1">${Number(product.oldPrice).toLocaleString()} ${escapeHtml(currency)}</div>` : ''}
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="text-[10px] font-bold ${Number(product.stock) <= 0 ? 'text-error' : 'text-tertiary'}">${Number(product.stock) <= 0 ? catalogCopy('نفد', 'Out') : catalogCopy(`المتبقي ${product.stock}`, `${product.stock} left`)}</span>
          <button type="button" data-product-id="${escapeHtml(product.id)}" class="add-cart-button inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-tertiary-container hover:bg-tertiary text-on-tertiary font-bold cursor-pointer font-sans border-none text-xs" ${Number(product.stock) <= 0 ? 'disabled' : ''}>
            <span class="material-symbols-outlined text-sm" aria-hidden="true">shopping_cart</span>
            ${Number(product.stock) <= 0 ? catalogCopy('نفد', 'Out') : catalogCopy('إضافة', 'Add')}
          </button>
        </div>
      </div>
    </article>
  `;
}

function syncCatalogHeader() {
  const header = document.querySelector('#header-container header');
  if (!header) return;
  const update = () => document.body.style.setProperty('--catalog-header-height', `${header.getBoundingClientRect().height}px`);
  update();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(update).observe(header);
}

document.addEventListener('componentsLoaded', syncCatalogHeader);
