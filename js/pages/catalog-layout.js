// Presentation shared only by the two catalog pages.
Object.assign(translations.ar, { catalog_search: 'ابحث بالاسم، الموديل، السعة، المعالج...', catalog_sort: 'الترتيب حسب:', catalog_electronics: 'الأجهزة الإلكترونية' });
Object.assign(translations.en, { catalog_search: 'Search name, model, storage, processor...', catalog_sort: 'Sort by:', catalog_electronics: 'Electronics' });
function catalogCopy(ar, en) { return getCurrentLanguage() === 'en' ? en : ar; }
function catalogMatchesSearch(item) {
  const query = document.getElementById('catalog-search').value.trim().toLocaleLowerCase();
  return [item.nameAr, item.nameEn, item.brand, item.category, item.extraAr, item.extraEn].join(' ').toLocaleLowerCase().includes(query);
}
function updateCatalogSummary(total, filtered, shown, filters) {
  document.getElementById('catalog-total').textContent = catalogCopy(`${total} جهاز متاح حالياً`, `${total} devices available`);
  document.getElementById('products-count').textContent = catalogCopy(`إظهار ${shown ? 1 : 0} - ${shown} من ${filtered} نتيجة`, `Showing ${shown ? 1 : 0} – ${shown} of ${filtered} results`);
  const labels = filters.filter(value => value !== 'all').map(value => storefrontText(`cat_${value}`, value));
  if (catalogConditions !== null) {
    labels.push(...catalogFacets.filter(item => catalogConditions.includes(item.value)).map(item => item.label));
    if (!catalogConditions.length) labels.push(catalogCopy('لم تُحدد أي حالة', 'No conditions selected'));
  }
  labels.push(...catalogStorage);
  const query = document.getElementById('catalog-search').value.trim();
  if (query) labels.push(query);
  document.getElementById('applied-filters').innerHTML = `<span class="text-secondary">${catalogCopy('الفلاتر المطبقة:', 'Applied filters:')}</span>` + (labels.length ? labels : [catalogCopy('الكل', 'All')]).map(value => `<span class="bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/10">${escapeHtml(value)}</span>`).join('');
  if (!filtered) document.getElementById('products-grid').innerHTML = `<p class="col-span-full p-6 text-secondary">${catalogCopy('لا توجد أجهزة تطابق البحث.', 'No devices match your search.')}</p>`;
}
let catalogConditions = null;
let catalogStorage = [];
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
  return (catalogConditions === null || catalogConditions.includes(catalogCondition(item))) &&
    (!catalogStorage.length || catalogStorage.includes(catalogStorageValue(item)));
}
function renderCatalogFilters(options) {
  const items = options.products || [];
  const conditions = new Map();
  items.forEach(item => {
    const value = catalogCondition(item);
    if (!conditions.has(value)) conditions.set(value, { value, count: 0, label: value === 'new' ? catalogCopy('جديد بالكرتونة المبرشمة', 'Factory sealed new') : getLocalizedValue(item, 'condition') });
    conditions.get(value).count++;
  });
  catalogFacets = [...conditions.values()];
  const storages = [...new Set(items.map(catalogStorageValue).filter(Boolean))].sort((a,b) => parseInt(a)-parseInt(b));
  document.getElementById('filters-container').innerHTML = `<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/10 flex flex-col gap-4 text-xs">
    <div class="flex items-center justify-between pb-2 border-b border-outline-variant/10 font-bold"><div class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-base" aria-hidden="true">tune</span>${catalogCopy('فلترة الأجهزة','Filter devices')}</div><button id="reset-filters" type="button" class="text-error hover:underline font-bold cursor-pointer bg-transparent border-none">${catalogCopy('تفريغ الفلاتر','Reset')}</button></div>
    <fieldset class="flex flex-col gap-2"><legend class="font-bold mb-2">${catalogCopy('حالة الجهاز والفحص','Device condition & inspection')}</legend>
    ${catalogFacets.map(item => `<label class="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-surface-container-low cursor-pointer"><span class="flex items-center gap-2"><input type="checkbox" name="catalog-condition" value="${escapeHtml(item.value)}" ${catalogConditions === null || catalogConditions.includes(item.value) ? 'checked' : ''} class="accent-primary w-4 h-4 cursor-pointer"><span class="text-on-surface font-semibold">${escapeHtml(item.label)}</span></span><span class="${item.value === 'new' ? 'bg-primary/10 text-primary' : 'bg-tertiary-fixed text-on-tertiary-fixed'} px-2 py-0.5 rounded-full font-bold">${item.count.toLocaleString(getCurrentLanguage() === 'en' ? 'en' : 'ar')}</span></label>`).join('')}
    </fieldset>
    <div class="h-px bg-outline-variant/10"></div>
    <fieldset class="flex flex-col gap-2"><legend class="font-bold mb-2">${catalogCopy('سعة التخزين','Storage capacity')}</legend><div class="grid grid-cols-2 gap-1 font-bold">
    ${storages.map(value => `<button type="button" data-storage="${value}" aria-pressed="${catalogStorage.includes(value)}" class="storage-filter py-2 rounded cursor-pointer border-none ${catalogStorage.includes(value) ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-secondary hover:text-primary'}">${value}</button>`).join('')}
    </div>${!storages.length ? `<p class="text-secondary">${catalogCopy('لا تتوفر معلومات السعة لهذه الأجهزة.', 'Storage information is unavailable for these devices.')}</p>` : ''}</fieldset>
    <div class="h-px bg-outline-variant/10"></div>
    <button id="apply-filters" type="button" class="w-full py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-bold shadow-md cursor-pointer transition-all border-none">${catalogCopy('تطبيق التصفية','Apply filters')}</button>
  </div>`;
}
function bindCatalogFilters(onChange) {
  document.querySelectorAll('.storage-filter').forEach(button => button.addEventListener('click', () => {
    const selected = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('bg-primary', selected);
    button.classList.toggle('text-on-primary', selected);
    button.classList.toggle('bg-surface-container-low', !selected);
    button.classList.toggle('text-secondary', !selected);
  }));
  document.getElementById('apply-filters').addEventListener('click', () => {
    catalogConditions = Array.from(document.querySelectorAll('input[name="catalog-condition"]:checked'), input => input.value);
    catalogStorage = Array.from(document.querySelectorAll('.storage-filter[aria-pressed="true"]'), button => button.dataset.storage);
    onChange({ category: 'all', brand: 'all', condition: 'all' });
  });
  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('catalog-search').value = '';
    catalogConditions = null;
    catalogStorage = [];
    onChange({ category:'all', brand:'all', condition:'all' });
  });
}
function renderProductCard(product, variant) {
  const refurbished = variant === 'refurbished';
  const name = getLocalizedValue(product, 'name');
  const badge = refurbished ? getLocalizedValue(product, 'condition') : catalogCopy('جديد كلياً', 'Brand new');
  const currency = catalogCopy(product.currencyAr || 'ر.ع.', product.currencyEn || 'OMR');
  return `<article class="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/10 hover:shadow-xl transition-all flex flex-col justify-between group">
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="${refurbished ? 'bg-tertiary text-on-tertiary' : 'bg-primary text-on-primary'} px-2 py-0.5 rounded-full font-bold text-[10px]">${escapeHtml(badge)}</span>
        <button type="button" class="wishlist-button text-secondary hover:text-error cursor-pointer bg-transparent border-none" data-product-id="${escapeHtml(product.id)}" aria-label="${catalogCopy('إضافة للمفضلة','Add to wishlist')}"><span class="material-symbols-outlined text-base" aria-hidden="true">favorite</span></button>
      </div>
      <div class="relative w-full aspect-square bg-surface-container-low rounded-lg p-2 mb-2 flex items-center justify-center border border-outline-variant/10"><img class="w-full h-full object-contain p-1" loading="lazy" alt="${escapeHtml(name)}" src="${escapeHtml(safeMediaUrl(product.image, STOREFRONT_PLACEHOLDER_IMAGE))}"></div>
      <h3 class="font-bold text-on-surface line-clamp-2 min-h-[2rem] mb-1 text-xs" title="${escapeHtml(name)}">${escapeHtml(name)}</h3>
      <div class="flex items-center gap-1 text-tertiary mb-2 font-bold text-[11px]"><span class="material-symbols-outlined text-sm" aria-hidden="true">${refurbished ? 'verified' : 'inventory_2'}</span><span>${catalogCopy(`متوفر (${product.stock})`, `${product.stock} available`)}</span></div>
      ${refurbished ? `<div class="flex flex-wrap gap-2 text-[11px] text-secondary mb-2">${product.battery != null ? `<span>${catalogCopy('البطارية','Battery')} ${escapeHtml(product.battery)}%</span>` : ''}${product.warrantyMonths != null ? `<span>${catalogCopy('الضمان','Warranty')} ${escapeHtml(product.warrantyMonths)} ${catalogCopy('أشهر','months')}</span>` : ''}</div>` : ''}
    </div>
    <div class="pt-2 border-t border-outline-variant/10 flex flex-wrap gap-2 items-center justify-between font-mono">
      <span class="font-bold text-primary text-sm">${Number(product.price).toLocaleString()} <span class="text-xs font-normal font-sans text-secondary">${escapeHtml(currency)}</span></span>
      <button type="button" data-product-id="${escapeHtml(product.id)}" class="add-cart-button px-3 py-1.5 rounded-lg bg-tertiary-container hover:bg-tertiary text-on-tertiary font-bold cursor-pointer font-sans border-none">${catalogCopy('أضف للسلة','Add to cart')}</button>
    </div>
  </article>`;
}

// Match the actual fixed header height, including wrapped mobile banners.
function syncCatalogHeader() {
  const header = document.querySelector('#header-container header');
  if (!header) return;
  const update = () => document.body.style.setProperty('--catalog-header-height', `${header.getBoundingClientRect().height}px`);
  update();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(update).observe(header);
}
document.addEventListener('componentsLoaded', syncCatalogHeader);
