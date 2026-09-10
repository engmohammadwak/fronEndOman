const STOREFRONT_PLACEHOLDER_IMAGE = typeof appBaseUrl !== 'undefined'
  ? new URL('assets/images/product-placeholder.svg', appBaseUrl).href
  : '/assets/images/product-placeholder.svg';

function getCurrentLanguage() {
  if (typeof currentLang === 'string' && (currentLang === 'en' || currentLang === 'ar')) {
    return currentLang;
  }
  return document.documentElement.lang === 'en' ? 'en' : 'ar';
}

function getLocalizedValue(item, field) {
  const lang = getCurrentLanguage();

  if (lang === 'en') {
    return item[`${field}En`] || item[`${field}Ar`] || item[field] || '';
  }

  return item[`${field}Ar`] || item[`${field}En`] || item[field] || '';
}

function storefrontText(key, fallback) {
  const lang = getCurrentLanguage();
  if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  return fallback || '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeMediaUrl(url, fallback) {
  if (typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('../../') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }
  return fallback;
}

function getProductPageUrl(id) {
  const base = typeof appBaseUrl !== 'undefined' ? appBaseUrl : window.location.origin;
  const path = (typeof AppRoutes !== 'undefined' && AppRoutes.page) ? AppRoutes.page('product') : '/product';
  const url = new URL(String(path).replace(/^\//, ''), base);
  url.searchParams.set('id', id);
  return url.href;
}

function updateDemoNotice(usingDemoData) {
  if (document.getElementById('demo-data-notice')?.dataset.apiError === 'true') { showApiError(); return; }
  const notice = document.getElementById('demo-data-notice');
  if (!notice) return;

  notice.textContent = storefrontText(
    'demo_data_notice',
    'يتم عرض بيانات تجريبية مؤقتاً إلى حين الاتصال بلوحة التحكم.'
  );
  notice.classList.add('catalog-demo');
  notice.classList.toggle('hidden', !usingDemoData);
}

function setPageCopy(titleKey, descriptionKey) {
  const title = document.getElementById('page-title');
  const description = document.getElementById('page-description');

  if (title) title.textContent = storefrontText(titleKey);
  if (description) description.textContent = storefrontText(descriptionKey);
}

function sortProductsList(items, sortType) {
  const sorted = items.slice();

  if (sortType === 'rating') {
    sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  } else if (sortType === 'price-low') {
    sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortType === 'price-high') {
    sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else {
    sorted.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }

  return sorted;
}

function uniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))];
}

function renderCatalogFilters(options) {
  const container = document.getElementById('filters-container');
  if (!container) return;

  const lang = getCurrentLanguage();
  const categories = options.categories || [];
  const brands = options.brands || [];
  const conditions = options.conditions || [];
  const categoryLabel = (value) => storefrontText(`cat_${value}`, value);

  container.innerHTML = `
    <div class="rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-4 shadow-sm">
      <h2 class="font-bold text-on-surface mb-4">${escapeHtml(storefrontText('filters_title', 'تصفية النتائج'))}</h2>

      <label class="block text-sm text-secondary mb-3">
        <span class="block mb-1 font-bold text-on-surface">${escapeHtml(storefrontText('filter_category', 'الفئة'))}</span>
        <select id="filter-category" class="w-full rounded-lg border border-outline-variant/30 p-2 bg-surface-container-lowest text-sm">
          <option value="all">${escapeHtml(storefrontText('filter_all', 'الكل'))}</option>
          ${categories.map((value) => `
            <option value="${escapeHtml(value)}" ${options.activeCategory === value ? 'selected' : ''}>
              ${escapeHtml(categoryLabel(value))}
            </option>
          `).join('')}
        </select>
      </label>

      <label class="block text-sm text-secondary mb-3">
        <span class="block mb-1 font-bold text-on-surface">${escapeHtml(storefrontText('filter_brand', 'الماركة'))}</span>
        <select id="filter-brand" class="w-full rounded-lg border border-outline-variant/30 p-2 bg-surface-container-lowest text-sm">
          <option value="all">${escapeHtml(storefrontText('filter_all', 'الكل'))}</option>
          ${brands.map((value) => `
            <option value="${escapeHtml(value)}" ${options.activeBrand === value ? 'selected' : ''}>
              ${escapeHtml(value)}
            </option>
          `).join('')}
        </select>
      </label>

      ${conditions.length ? `
        <label class="block text-sm text-secondary">
          <span class="block mb-1 font-bold text-on-surface">${escapeHtml(storefrontText('filter_condition', 'الحالة'))}</span>
          <select id="filter-condition" class="w-full rounded-lg border border-outline-variant/30 p-2 bg-surface-container-lowest text-sm">
            <option value="all">${escapeHtml(storefrontText('filter_all', 'الكل'))}</option>
            ${conditions.map((item) => `
              <option value="${escapeHtml(item.value)}" ${options.activeCondition === item.value ? 'selected' : ''}>
                ${escapeHtml(lang === 'en' ? item.labelEn : item.labelAr)}
              </option>
            `).join('')}
          </select>
        </label>
      ` : ''}
    </div>
  `;
}

function bindCatalogFilters(onChange) {
  const category = document.getElementById('filter-category');
  const brand = document.getElementById('filter-brand');
  const condition = document.getElementById('filter-condition');

  if (category) category.addEventListener('change', () => onChange({ category: category.value }));
  if (brand) brand.addEventListener('change', () => onChange({ brand: brand.value }));
  if (condition) condition.addEventListener('change', () => onChange({ condition: condition.value }));
}

function normalizeProduct(apiProduct) {
  if (!apiProduct || apiProduct.id == null || apiProduct.price == null || !Number.isFinite(Number(apiProduct.price)) || Number(apiProduct.price) < 0) throw new Error('Invalid product identity or price');
  if (!Number.isSafeInteger(Number(apiProduct.stock ?? 0)) || Number(apiProduct.stock ?? 0) < 0) throw new Error('Invalid product stock');
  return {
    id: apiProduct.id,
    variantId: apiProduct.variant_id ?? apiProduct.variantId,
    nameAr: apiProduct.name_ar || apiProduct.nameAr || apiProduct.name || '',
    nameEn: apiProduct.name_en || apiProduct.nameEn || apiProduct.name || '',
    brand: apiProduct.brand?.name || apiProduct.brand || '',
    category: apiProduct.category?.slug || apiProduct.category || '',
    price: Number(apiProduct.price),
    oldPrice: apiProduct.old_price != null && apiProduct.old_price !== ''
      ? Number(apiProduct.old_price)
      : (apiProduct.oldPrice != null && apiProduct.oldPrice !== '' ? Number(apiProduct.oldPrice) : null),
    currencyAr: apiProduct.currency_ar || apiProduct.currencyAr || 'ر.ع.',
    currencyEn: apiProduct.currency_en || apiProduct.currencyEn || 'OMR',
    rating: Number(apiProduct.rating || 0),
    reviews: Number(apiProduct.reviews_count || apiProduct.reviews || 0),
    stock: Number(apiProduct.stock || 0),
    badgeAr: apiProduct.badge_ar || apiProduct.badgeAr || '',
    badgeEn: apiProduct.badge_en || apiProduct.badgeEn || '',
    image: apiProduct.image_url || apiProduct.image || STOREFRONT_PLACEHOLDER_IMAGE,
    conditionAr: apiProduct.condition_ar || apiProduct.conditionAr || '',
    conditionEn: apiProduct.condition_en || apiProduct.conditionEn || '',
    storageGb: apiProduct.storage_gb ?? apiProduct.storageGb ?? null,
    battery: apiProduct.battery != null ? Number(apiProduct.battery) : null,
    warrantyMonths: apiProduct.warranty_months != null
      ? Number(apiProduct.warranty_months)
      : (apiProduct.warrantyMonths != null ? Number(apiProduct.warrantyMonths) : null),
    extraAr: apiProduct.extra_ar || apiProduct.extraAr || '',
    extraEn: apiProduct.extra_en || apiProduct.extraEn || '',
    brandAr: apiProduct.brand_ar || apiProduct.brandAr || '',
    brandEn: apiProduct.brand_en || apiProduct.brandEn || (apiProduct.brand?.name || apiProduct.brand || ''),
    keywords: apiProduct.keywords || '',
    specs: Array.isArray(apiProduct.specs) ? apiProduct.specs : [],
    model: apiProduct.model || '',
    listingType: apiProduct.listing_type || apiProduct.listingType
      || (apiProduct.is_refurbished || apiProduct.condition === 'refurbished' ? 'refurbished' : 'new'),
    isDemo: false
  };
}

function normalizeOffer(apiOffer) {
  return {
    id: apiOffer.id,
    titleAr: apiOffer.title_ar || apiOffer.titleAr || apiOffer.title || '',
    titleEn: apiOffer.title_en || apiOffer.titleEn || apiOffer.title || '',
    descriptionAr: apiOffer.description_ar || apiOffer.descriptionAr || '',
    descriptionEn: apiOffer.description_en || apiOffer.descriptionEn || '',
    discount: Number(apiOffer.discount || 0),
    expiresAt: apiOffer.expires_at || apiOffer.expiresAt || '',
    productIds: Array.isArray(apiOffer.product_ids) ? apiOffer.product_ids : (apiOffer.productIds || []),
    image: apiOffer.image_url || apiOffer.image || STOREFRONT_PLACEHOLDER_IMAGE,
    isDemo: false
  };
}

function normalizeBrand(apiBrand) {
  return {
    id: apiBrand.id,
    name: apiBrand.name || apiBrand.slug || '',
    nameAr: apiBrand.name_ar || apiBrand.nameAr || apiBrand.name || '',
    nameEn: apiBrand.name_en || apiBrand.nameEn || apiBrand.name || '',
    logo: apiBrand.logo_url || apiBrand.logo || STOREFRONT_PLACEHOLDER_IMAGE,
    productCount: Number(apiBrand.product_count || apiBrand.productCount || 0),
    isDemo: false
  };
}

function normalizeFaq(apiFaq) {
  return {
    id: apiFaq.id,
    questionAr: apiFaq.question_ar || apiFaq.questionAr || apiFaq.question || '',
    questionEn: apiFaq.question_en || apiFaq.questionEn || apiFaq.question || '',
    answerAr: apiFaq.answer_ar || apiFaq.answerAr || apiFaq.answer || '',
    answerEn: apiFaq.answer_en || apiFaq.answerEn || apiFaq.answer || '',
    category: apiFaq.category || 'orders',
    isDemo: false
  };
}

function renderProductCard(product, variant) {
  const lang = getCurrentLanguage();
  const name = getLocalizedValue(product, 'name');
  const badge = variant === 'refurbished'
    ? (lang === 'en' ? product.conditionEn : product.conditionAr) || (lang === 'en' ? product.badgeEn : product.badgeAr)
    : (lang === 'en' ? product.badgeEn : product.badgeAr);
  const currency = lang === 'en' ? product.currencyEn : product.currencyAr;
  const addLabel = lang === 'en' ? 'Add' : 'إضافة';
  const extra = getLocalizedValue(product, 'extra');
  const image = safeMediaUrl(product.image, STOREFRONT_PLACEHOLDER_IMAGE);
  const badgeClass = variant === 'refurbished'
    ? 'bg-tertiary-container text-on-tertiary'
    : (product.oldPrice ? 'bg-error text-on-error' : 'bg-primary-container text-on-primary');

  return `
    <article class="flex flex-col bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/10 hover:shadow-xl transition-all relative group">

      <div class="flex items-center justify-between mb-2">
        <span class="px-2 py-0.5 rounded-full ${badgeClass} text-[10px] font-bold">
          ${escapeHtml(badge)}
        </span>

        <button
          type="button"
          class="wishlist-button w-7 h-7 rounded-full bg-surface-container-low text-secondary hover:text-error flex items-center justify-center bg-transparent border-none cursor-pointer"
          data-product-id="${escapeHtml(product.id)}"
          aria-label="${lang === 'en' ? 'Add to wishlist' : 'إضافة للمفضلة'}"
        >
          <span class="material-symbols-outlined text-base" aria-hidden="true">favorite</span>
        </button>
      </div>

      <a class="catalog-card-link" href="${escapeHtml(getProductPageUrl(product.id))}">
      <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container-lowest mb-2 flex items-center justify-center border border-outline-variant/10">
        <img
          class="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
          src="${escapeHtml(image)}"
          alt="${escapeHtml(name)}"
          loading="lazy"
        >
      </div>

      <div class="flex items-center gap-1 text-secondary mb-1">
        <span
          class="material-symbols-outlined text-xs text-amber-500"
          style="font-variation-settings: 'FILL' 1;"
          aria-hidden="true"
        >
          star
        </span>
        <span class="font-bold text-on-surface">${escapeHtml(product.rating)}</span>
        <span class="text-[11px] text-secondary">
          (${escapeHtml(product.reviews)})
        </span>
      </div>

      ${variant === 'refurbished' ? `
        <div class="flex items-center gap-1 text-secondary mb-2 flex-wrap font-semibold text-[11px]">
          ${product.battery != null ? `<span class="bg-surface-container px-2 py-0.5 rounded">${lang === 'en' ? `Battery ${escapeHtml(product.battery)}%` : `بطارية ${escapeHtml(product.battery)}%`}</span>` : ''}
          ${product.warrantyMonths != null ? `<span class="bg-surface-container px-2 py-0.5 rounded">${lang === 'en' ? `${escapeHtml(product.warrantyMonths)} months warranty` : `ضمان ${escapeHtml(product.warrantyMonths)} أشهر`}</span>` : ''}
          ${extra ? `<span class="bg-surface-container px-2 py-0.5 rounded">${escapeHtml(extra)}</span>` : ''}
        </div>
      ` : ''}

      <h3 class="font-bold text-on-surface line-clamp-2 mb-2 leading-relaxed">
        ${escapeHtml(name)}
      </h3>
      </a>

      <div class="flex items-center gap-1 text-tertiary mb-3 text-[11px] font-bold">
        <span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
        <span>
          ${lang === 'en' ? `${escapeHtml(product.stock)} available` : `متوفر (${escapeHtml(product.stock)})`}
        </span>
      </div>

      <div class="mt-auto pt-2 border-t border-outline-variant/10 flex items-center justify-between font-mono">
        <div>
          <span class="text-sm font-black text-primary">
            ${Number(product.price || 0).toLocaleString()}
            <span class="text-xs font-normal font-sans text-secondary">
              ${escapeHtml(currency)}
            </span>
          </span>

          ${
            product.oldPrice
              ? `
                <span class="text-[10px] text-secondary line-through font-sans mr-1">
                  ${Number(product.oldPrice).toLocaleString()} ${escapeHtml(currency)}
                </span>
              `
              : ''
          }
        </div>

        <button
          type="button"
          class="add-cart-button px-3 py-1.5 rounded-lg bg-tertiary-container hover:bg-tertiary text-on-tertiary font-bold flex items-center gap-1 border-none cursor-pointer"
          data-product-id="${escapeHtml(product.id)}"
        >
          <span class="material-symbols-outlined text-sm" aria-hidden="true">shopping_cart</span>
          <span class="font-sans">${escapeHtml(addLabel)}</span>
        </button>
      </div>
    </article>
  `;
}

function hydrateLiveCatalog(list) {
  const source = Array.isArray(list) ? list : [];
  if (!isDemoMode() || typeof StoreState === 'undefined') return source;
  StoreState.ensure();
  StoreState.syncFromCatalog(source);
  const live = StoreState.getProducts();
  if (!live.length) return [];
  return live.filter((item) => item.active !== false).map((item) => {
    const original = source.find((row) => String(row.id) === String(item.id)) || {};
    return { ...original, ...item, stock: Number(item.stock || 0) };
  });
}

function applyLiveStock(list) {
  const source = Array.isArray(list) ? list : [];
  if (!isDemoMode() || typeof StoreState === 'undefined') return source;
  StoreState.ensure();
  StoreState.syncFromCatalog(source);
  return source.map((item) => StoreState.applyLiveProduct(item)).filter((item) => item.active !== false);
}

function liveStockFor(product) {
  if (!product) return 0;
  if (isDemoMode() && typeof StoreState !== 'undefined') return StoreState.availableStock(product.id || product.productId);
  return Number(product.stock || 0);
}

function buildCartPayload(product, extras) {
  extras = extras || {};
  return {
    productId: product.id,
    variantId: extras.variantId ?? product.variantId,
    stock: isDemoMode() && typeof StoreState !== 'undefined' ? StoreState.availableStock(product.id) : product.stock,
    isDemo: product.isDemo === true,
    nameAr: product.nameAr || product.name,
    nameEn: product.nameEn || product.name,
    image: product.image,
    price: Number(extras.price != null ? extras.price : product.price),
    oldPrice: extras.oldPrice != null ? extras.oldPrice : product.oldPrice,
    qty: extras.qty || 1,
    conditionAr: extras.conditionAr || product.conditionAr || (product.listingType === 'refurbished' ? 'مجدد معتمد' : 'جديد كلياً'),
    conditionEn: extras.conditionEn || product.conditionEn || (product.listingType === 'refurbished' ? 'Certified refurbished' : 'Brand new'),
    extraAr: extras.extraAr || product.extraAr || '',
    extraEn: extras.extraEn || product.extraEn || '',
    colorAr: extras.colorAr || '',
    colorEn: extras.colorEn || '',
    storage: extras.storage || product.storageGb || '',
    addonNameAr: extras.addonNameAr || '',
    addonNameEn: extras.addonNameEn || '',
    addonPrice: extras.addonPrice != null ? extras.addonPrice : 0,
    addonActive: !!extras.addonActive
  };
}

function bindProductActions(pageData) {
  document.querySelectorAll('.add-cart-button').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = String(button.dataset.productId);
      const product = pageData.find((item) => String(item.id) === productId);

      if (!product) return;

      if (liveStockFor(product) <= 0) {
        showToast(getCurrentLanguage() === 'en' ? 'This device is out of stock.' : 'هذا الجهاز نفد من المخزن.', 'error');
        return;
      }
      if (typeof addToCart === 'function') {
        if (addToCart(buildCartPayload(product)) === false) {
          showToast(getCurrentLanguage() === 'en' ? 'Requested quantity is unavailable.' : 'الكمية المطلوبة غير متوفرة.', 'error');
          return;
        }
      }

      if (typeof showToast === 'function') {
        const message = getCurrentLanguage() === 'en'
          ? 'Product added to cart successfully.'
          : 'تمت إضافة المنتج إلى السلة بنجاح.';

        showToast(message, 'success');
      }
    });
  });

  document.querySelectorAll('.wishlist-button').forEach((button) => {
    const productId = String(button.dataset.productId);
    const icon = button.querySelector('.material-symbols-outlined');
    const wished = typeof wishlist !== 'undefined' && Array.isArray(wishlist)
      && wishlist.some((item) => String(item.id) === productId);

    if (wished && icon) icon.style.fontVariationSettings = "'FILL' 1";
    if (wished) button.classList.add('is-active');

    button.addEventListener('click', () => {
      const product = pageData.find((item) => String(item.id) === productId);
      const snapshot = product ? {
        isDemo: product.isDemo === true,
        stock: product.stock,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        image: product.image,
        price: product.price,
        oldPrice: product.oldPrice || null
      } : null;
      const added = typeof toggleWishlist === 'function'
        ? toggleWishlist(productId, snapshot)
        : (typeof addToWishlist === 'function' ? addToWishlist(productId, snapshot) : false);
      if (icon) icon.style.fontVariationSettings = added ? "'FILL' 1" : "'FILL' 0";
      button.classList.toggle('is-active', added);

      if (typeof showToast === 'function') {
        const message = added
          ? (getCurrentLanguage() === 'en' ? 'Product added to wishlist.' : 'تمت إضافة المنتج إلى المفضلة.')
          : (getCurrentLanguage() === 'en' ? 'Removed from wishlist.' : 'تمت إزالة المنتج من المفضلة.');
        showToast(message, added ? 'success' : 'info');
      }
    });
  });
}

function updateProductsCount(count, visibleLength) {
  const countEl = document.getElementById('products-count');
  if (!countEl) return;

  const template = storefrontText('products_count', getCurrentLanguage() === 'en'
    ? 'Showing {count} products'
    : 'عرض {count} منتج');
  countEl.textContent = template.replace('{count}', String(visibleLength ?? count));
}

function updateLoadMoreButton(visibleCount, totalCount) {
  const button = document.getElementById('load-more-button');
  if (!button) return;
  button.textContent = storefrontText('load_more', 'تحميل المزيد');
  button.classList.toggle('hidden', visibleCount >= totalCount);
}

function updateSortSelectLabels() {
  const select = document.getElementById('sort-select');
  if (!select) return;

  const labels = {
    latest: storefrontText('sort_latest', 'الأحدث'),
    rating: storefrontText('sort_rating', 'الأعلى تقييماً'),
    'price-low': storefrontText('sort_price_low', 'السعر: من الأقل للأعلى'),
    'price-high': storefrontText('sort_price_high', 'السعر: من الأعلى للأقل')
  };

  Array.from(select.options).forEach((option) => {
    if (labels[option.value]) option.textContent = labels[option.value];
  });
}

function formatRemainingTime(expiresAt) {
  const end = new Date(expiresAt).getTime();
  if (!Number.isFinite(end)) return getCurrentLanguage() === 'en' ? 'Limited time' : 'وقت محدود';

  const diff = Math.max(0, end - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  return getCurrentLanguage() === 'en'
    ? `${days}d ${hours}h`
    : `${days}ي ${hours}س`;
}

function onStorefrontReady(init) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
