const pdpState = {
  catalog: [],
  product: null,
  usingDemo: true,
  galleryIndex: 0,
  condition: 'new',
  colorIndex: 0,
  storageIndex: 0,
  tab: 'specs',
  bundle: {},
  qty: 1
};

function pdpText(key, fallback) {
  return storefrontText(key, fallback);
}

function pdpCopy(ar, en) {
  return getCurrentLanguage() === 'en' ? en : ar;
}

function pdpCurrency(product) {
  return getCurrentLanguage() === 'en'
    ? (product.currencyEn || 'OMR')
    : (product.currencyAr || 'ر.ع.');
}

function formatMoney(amount, product) {
  return `${Number(amount).toLocaleString()} ${pdpCurrency(product)}`;
}

function listingTypeOf(product) {
  return product.listingType === 'refurbished' ? 'refurbished' : 'new';
}

function buildSku(product) {
  const brand = String(product.brand || 'TP').replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'TP';
  const storage = product.storageGb ? `-${product.storageGb}` : '';
  const kind = listingTypeOf(product) === 'refurbished' ? 'RF' : 'NW';
  return `TP-${brand}-${kind}-${product.id}${storage}`;
}

function defaultGallery(product) {
  return [{ src: product.image, labelAr: 'الرئيسية', labelEn: 'Main' }];
}

function defaultVariants(product) {
  return [{
    type: listingTypeOf(product),
    price: Number(product.price),
    oldPrice: product.oldPrice != null ? Number(product.oldPrice) : null,
    battery: product.battery,
    labelAr: listingTypeOf(product) === 'refurbished'
      ? (product.conditionAr || 'مجدد معتمد')
      : 'جديد كلياً',
    labelEn: listingTypeOf(product) === 'refurbished'
      ? (product.conditionEn || 'Certified refurbished')
      : 'Brand new sealed'
  }];
}

function defaultStorage(product) {
  if (!product.storageGb) return [];
  return [{ id: String(product.storageGb), labelAr: `${product.storageGb} جيجابايت`, labelEn: `${product.storageGb} GB`, price: Number(product.price), oldPrice: product.oldPrice ?? null }];
}

function defaultSpecs(product) {
  return [
    {
      icon: 'memory',
      titleAr: 'الملخص التقني',
      titleEn: 'Technical summary',
      rows: [
        { labelAr: 'الماركة', labelEn: 'Brand', valueAr: product.brandAr || product.brand, valueEn: product.brand },
        { labelAr: 'الفئة', labelEn: 'Category', valueAr: pdpText(`cat_${product.category}`, product.category), valueEn: pdpText(`cat_${product.category}`, product.category) },
        { labelAr: 'المواصفات', labelEn: 'Highlights', valueAr: product.extraAr || product.extraEn || '—', valueEn: product.extraEn || product.extraAr || '—' },
        { labelAr: 'السعة', labelEn: 'Storage', valueAr: product.storageGb ? `${product.storageGb} جيجابايت` : '—', valueEn: product.storageGb ? `${product.storageGb} GB` : '—' }
      ]
    },
    {
      icon: 'verified',
      titleAr: 'التوفر والضمان',
      titleEn: 'Availability & warranty',
      rows: [
        { labelAr: 'الحالة', labelEn: 'Condition', valueAr: listingTypeOf(product) === 'refurbished' ? (product.conditionAr || 'مجدد معتمد') : 'جديد أصلي', valueEn: listingTypeOf(product) === 'refurbished' ? (product.conditionEn || 'Certified refurbished') : 'Brand new' },
        { labelAr: 'المخزون', labelEn: 'Stock', valueAr: `${product.stock} قطعة`, valueEn: `${product.stock} units` },
        { labelAr: 'الضمان', labelEn: 'Warranty', valueAr: `${product.warrantyMonths ?? '—'} شهراً`, valueEn: `${product.warrantyMonths ?? '—'} months` },
        { labelAr: 'التقييم', labelEn: 'Rating', valueAr: `${product.rating} / 5`, valueEn: `${product.rating} / 5` }
      ]
    }
  ];
}

function defaultInspection(product) {
  if (listingTypeOf(product) !== 'refurbished') return null;
  return {
    battery: product.battery != null ? Number(product.battery) : 95,
    screenAr: 'شاشة أصلية سليمة',
    screenEn: 'Original screen, verified',
    cameraAr: 'العدسات والتصوير سليمة',
    cameraEn: 'Cameras tested and clear',
    simAr: 'مفتوح رسمي',
    simEn: 'Officially unlocked'
  };
}

function defaultReviews(product) {
  const refurbished = listingTypeOf(product) === 'refurbished';
  return [
    {
      initial: 'ع',
      nameAr: 'عبدالعزيز الشمري',
      nameEn: 'Abdulaziz Al-Shammari',
      verified: true,
      stars: 5,
      dateAr: 'قبل 3 أيام',
      dateEn: '3 days ago',
      textAr: refurbished
        ? `طلبت النسخة المجددة ووصلني الجهاز بحالة ممتازة${product.battery ? ` وصحة البطارية ${product.battery}%` : ''}. التغليف والفحص واضحان وأنصح بالشراء.`
        : 'جهاز أصلي، التوصيل سريع والتعبئة ممتازة. التجربة تستحق والضمان واضح.',
      textEn: refurbished
        ? `The refurbished unit arrived in excellent condition${product.battery ? ` with ${product.battery}% battery health` : ''}. Inspection papers were included.`
        : 'Original device, fast delivery, and clear warranty. Highly recommended.'
    },
    {
      initial: 'س',
      nameAr: 'سارة الوهيبي',
      nameEn: 'Sara Al-Wahaibi',
      verified: true,
      stars: 5,
      dateAr: 'قبل أسبوع',
      dateEn: '1 week ago',
      textAr: 'خدمة العملاء ممتازة والسعر مناسب مقارنة بالسوق. راح أكرر التجربة.',
      textEn: 'Great support and a fair price compared with the market. I will buy again.'
    }
  ];
}

function defaultAccessories(product) {
  const category = product.category;
  if (category === 'phones' || category === 'tablets') {
    return [
      { id: 'case', nameAr: 'كفر حماية معتمد', nameEn: 'Certified protective case', extraAr: 'مضاد للصدمات', extraEn: 'Shock resistant', price: 199, image: ACCESSORY_IMAGES.case },
      { id: 'charger', nameAr: 'رأس شاحن 30W USB-C', nameEn: '30W USB-C charger', extraAr: 'شحن سريع معتمد', extraEn: 'Certified fast charging', price: 119, image: ACCESSORY_IMAGES.charger },
      { id: 'glass', nameAr: 'شاشة حماية زجاجية 9H', nameEn: '9H tempered glass', extraAr: 'مقاومة للخدوش', extraEn: 'Scratch resistant', price: 79, image: ACCESSORY_IMAGES.glass }
    ];
  }
  if (category === 'laptops') {
    return [
      { id: 'sleeve', nameAr: 'حقيبة حماية للابتوب', nameEn: 'Laptop sleeve', extraAr: 'مبطنة ضد الصدمات', extraEn: 'Padded protection', price: 149, image: ACCESSORY_IMAGES.case },
      { id: 'charger', nameAr: 'شاحن USB-C أصلي', nameEn: 'Original USB-C charger', extraAr: 'طاقة مستقرة', extraEn: 'Stable power', price: 189, image: ACCESSORY_IMAGES.charger },
      { id: 'hub', nameAr: 'محول منافذ USB-C', nameEn: 'USB-C hub', extraAr: 'HDMI + USB', extraEn: 'HDMI + USB', price: 129, image: ACCESSORY_IMAGES.glass }
    ];
  }
  return [];
}

function normalizePdpProduct(raw) {
  const base = typeof normalizeProduct === 'function' ? normalizeProduct(raw) : raw;
  return {
    ...base,
    sku: raw.sku || base.sku || '',
    gallery: Array.isArray(raw.gallery) ? raw.gallery : base.gallery,
    colors: Array.isArray(raw.colors) ? raw.colors : base.colors,
    storageOptions: Array.isArray(raw.storage_options || raw.storageOptions) ? (raw.storage_options || raw.storageOptions) : base.storageOptions,
    variants: Array.isArray(raw.variants) ? raw.variants : base.variants,
    reviewsList: Array.isArray(raw.reviews_list || raw.reviewsList) ? (raw.reviews_list || raw.reviewsList) : null,
    inspection: raw.inspection || null,
    accessories: Array.isArray(raw.accessories) ? raw.accessories : null,
    subtitleAr: raw.subtitle_ar || raw.subtitleAr || '',
    subtitleEn: raw.subtitle_en || raw.subtitleEn || '',
    seriesAr: raw.series_ar || raw.seriesAr || '',
    seriesEn: raw.series_en || raw.seriesEn || ''
  };
}

function enrichPdpProduct(product, catalog) {
  const profile = product.isDemo === true ? (PDP_PROFILES[Number(product.id)] || {}) : {};
  const listing = listingTypeOf(product);
  const variants = profile.variants || product.variants || defaultVariants(product);
  const accessories = profile.accessories || product.accessories || (product.isDemo === true ? defaultAccessories(product) : []);
  const inspectionSource = {
    ...product,
    listingType: variants.some((item) => item.type === 'refurbished') ? 'refurbished' : listing
  };
  return {
    ...product,
    sku: profile.sku || product.sku || buildSku(product),
    seriesAr: profile.seriesAr || product.seriesAr || (listing === 'refurbished' ? 'مجدد معتمد' : 'أصل بضمان الوكيل'),
    seriesEn: profile.seriesEn || product.seriesEn || (listing === 'refurbished' ? 'Certified refurbished' : 'Authorized new device'),
    subtitleAr: profile.subtitleAr || product.subtitleAr || product.extraAr || '',
    subtitleEn: profile.subtitleEn || product.subtitleEn || product.extraEn || '',
    gallery: (profile.gallery || product.gallery || defaultGallery(product)).map((item) => ({
      src: safeMediaUrl(item.src || item.image || item.url || product.image, STOREFRONT_PLACEHOLDER_IMAGE),
      labelAr: item.labelAr || item.label || 'صورة',
      labelEn: item.labelEn || item.label || 'Image'
    })),
    colors: profile.colors || product.colors || [],
    storageOptions: profile.storageOptions || product.storageOptions || defaultStorage(product),
    variants,
    specs: profile.specs || (Array.isArray(product.specs) && product.specs.length ? product.specs : defaultSpecs(product)),
    inspection: profile.inspection !== undefined ? profile.inspection : (product.inspection || (product.isDemo === true ? defaultInspection(inspectionSource) : null)),
    reviewsList: profile.reviews || product.reviewsList || (product.isDemo === true ? defaultReviews(product) : []),
    accessories,
    related: catalog
      .filter((item) => String(item.id) !== String(product.id) && item.category === product.category)
      .slice(0, 4)
  };
}

function activeVariant(product) {
  return product.variants.find((item) => item.type === pdpState.condition) || product.variants[0];
}

function activeStorage(product) {
  return product.storageOptions[pdpState.storageIndex] || product.storageOptions[0] || null;
}

function currentPrice(product) {
  const storage = activeStorage(product);
  const variant = activeVariant(product);
  if (storage && product.variants.length < 2) {
    return Number(storage.price);
  }
  if (storage && variant) {
    const delta = Number(storage.price) - Number(product.storageOptions[0].price);
    return Number(variant.price) + delta;
  }
  return Number((variant && variant.price) || product.price);
}

function currentOldPrice(product) {
  const storage = activeStorage(product);
  const variant = activeVariant(product);
  const old = (variant && variant.oldPrice) || (storage && storage.oldPrice) || product.oldPrice;
  return old != null ? Number(old) : null;
}

function bundleTotal(product) {
  return product.accessories.reduce((sum, item) => (
    pdpState.bundle[item.id] === false ? sum : sum + Number(item.price)
  ), 0);
}

function starsRow(count) {
  return Array.from({ length: 5 }, (_, index) => `
    <span class="material-symbols-outlined text-base text-amber-500" style="font-variation-settings: 'FILL' ${index < count ? 1 : 0};" aria-hidden="true">star</span>
  `).join('');
}

function renderNotFound() {
  return `
    <div class="pdp-empty">
      <span class="material-symbols-outlined text-5xl text-outline mb-3" aria-hidden="true">inventory_2</span>
      <h1 class="text-2xl font-black mb-2">${escapeHtml(pdpText('pdp_not_found_title', pdpCopy('هذا المنتج غير متوفر حالياً', 'This product is not available')))}</h1>
      <p class="text-secondary mb-5">${escapeHtml(pdpText('pdp_not_found_desc', pdpCopy('قد يكون الرابط قديماً أو المنتج غير مربوط بعد بلوحة التحكم.', 'The link may be outdated, or the product is not connected yet.')))}</p>
      <a class="pdp-btn pdp-btn-buy px-5" href="./catalog.html">${escapeHtml(pdpText('pdp_back_catalog', pdpCopy('العودة إلى الكتالوج', 'Back to catalog')))}</a>
    </div>
  `;
}

function renderBreadcrumb(product) {
  const name = getLocalizedValue(product, 'name');
  const category = pdpText(`cat_${product.category}`, product.category);
  const brand = product.brandAr && getCurrentLanguage() === 'ar' ? product.brandAr : product.brand;
  return `
    <div class="pdp-crumb">
      <nav aria-label="${escapeHtml(pdpText('pdp_breadcrumb', pdpCopy('مسار التصفح', 'Breadcrumb')))}">
        <a href="../../index.html">
          <span class="material-symbols-outlined text-base align-middle">home</span>
          ${escapeHtml(pdpText('nav_home', pdpCopy('الرئيسية', 'Home')))}
        </a>
        <span class="material-symbols-outlined text-xs rotate-180 text-outline">chevron_right</span>
        <a href="./catalog.html?cat=${encodeURIComponent(product.category)}">${escapeHtml(category)}</a>
        <span class="material-symbols-outlined text-xs rotate-180 text-outline">chevron_right</span>
        <a href="./catalog.html?q=${encodeURIComponent(product.brand)}">${escapeHtml(brand)}</a>
        <span class="material-symbols-outlined text-xs rotate-180 text-outline">chevron_right</span>
        <span class="is-current">${escapeHtml(name)}</span>
      </nav>
      <div class="pdp-sku">
        ${escapeHtml(pdpText('pdp_sku', 'SKU'))}:
        <code>${escapeHtml(product.sku)}</code>
      </div>
    </div>
  `;
}

function renderGallery(product) {
  const image = product.gallery[pdpState.galleryIndex] || product.gallery[0];
  const refurbished = pdpState.condition === 'refurbished' || listingTypeOf(product) === 'refurbished';
  const wished = typeof wishlist !== 'undefined' && Array.isArray(wishlist)
    && wishlist.some((item) => String(item.id) === String(product.id));
  return `
    <div>
      <div class="pdp-stage">
        <div class="pdp-badges">
          ${refurbished ? `<span class="pdp-badge pdp-badge-green"><span class="material-symbols-outlined text-sm">verified</span>${escapeHtml(pdpText('pdp_badge_inspect', pdpCopy('فحص معتمد 40 نقطة', '40-point certified check')))}</span>` : `<span class="pdp-badge pdp-badge-blue"><span class="material-symbols-outlined text-sm">verified</span>${escapeHtml(pdpText('pdp_badge_original', pdpCopy('أصلي بضمان الوكيل', 'Original authorized warranty')))}</span>`}
          <span class="pdp-badge pdp-badge-ink"><span class="material-symbols-outlined text-sm">local_shipping</span>${escapeHtml(pdpText('pdp_badge_ship', pdpCopy('شحن سريع', 'Fast delivery')))}</span>
        </div>
        <div class="pdp-tools">
          <button type="button" class="pdp-icon-btn ${wished ? 'is-active' : ''}" data-pdp-action="wishlist" aria-label="${escapeHtml(pdpText('pdp_wishlist', pdpCopy('أضف للمفضلة', 'Add to wishlist')))}">
            <span class="material-symbols-outlined" ${wished ? 'style="font-variation-settings: \'FILL\' 1;"' : ''}>favorite</span>
          </button>
          <button type="button" class="pdp-icon-btn" data-pdp-action="share" aria-label="${escapeHtml(pdpText('pdp_share', pdpCopy('مشاركة المنتج', 'Share product')))}">
            <span class="material-symbols-outlined">share</span>
          </button>
        </div>
        <img id="main-product-img" alt="${escapeHtml(getLocalizedValue(product, 'name'))}" src="${escapeHtml(image.src)}">
        ${product.gallery.length > 1 ? `<div class="pdp-hint"><span class="material-symbols-outlined text-sm text-primary">360</span>${escapeHtml(pdpText('pdp_gallery_hint', pdpCopy('تصفح زوايا الجهاز', 'Browse every angle')))}</div>` : ''}
      </div>
      ${product.gallery.length > 1 ? `
        <div class="pdp-thumbs">
          ${product.gallery.map((item, index) => `
            <button type="button" class="pdp-thumb ${index === pdpState.galleryIndex ? 'is-active' : ''}" data-pdp-action="gallery" data-index="${index}">
              <img alt="${escapeHtml(pdpCopy(item.labelAr, item.labelEn))}" src="${escapeHtml(item.src)}">
              <span>${escapeHtml(pdpCopy(item.labelAr, item.labelEn))}</span>
            </button>
          `).join('')}
        </div>
      ` : ''}
      ${renderLab(product)}
    </div>
  `;
}

function renderLab(product) {
  const show = pdpState.condition === 'refurbished' && product.inspection;
  if (!show) {
    return `
      <div class="pdp-lab">
        <div class="pdp-lab-head">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <h3 class="font-black">${escapeHtml(pdpText('pdp_new_trust_title', pdpCopy('ضمان الوكيل المعتمد', 'Authorized warranty')))}</h3>
              <p class="text-xs text-secondary mt-0.5">${escapeHtml(pdpText('pdp_new_trust_desc', pdpCopy('جهاز أصلي مع تغليف المصنع وختم الوكيل.', 'Original sealed device with authorized coverage.')))}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const battery = Number(product.inspection.battery || 95);
  return `
    <div class="pdp-lab">
      <div class="pdp-lab-head">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-black">${escapeHtml(pdpText('pdp_lab_title', pdpCopy('تقرير الفحص الفني', 'Lab inspection report')))}</h3>
              <span class="pdp-save">${escapeHtml(pdpText('pdp_lab_certified', pdpCopy('معتمد 100%', '100% certified')))}</span>
            </div>
            <p class="text-xs text-secondary mt-0.5">${escapeHtml(pdpText('pdp_lab_desc', pdpCopy('تم تدقيق الجهاز عبر 40 اختباراً في مراكز الصيانة المعتمدة.', 'Verified through 40 tests in certified service labs.')))}</p>
          </div>
        </div>
        <button type="button" class="pdp-btn pdp-btn-ghost" data-pdp-action="report">
          <span class="material-symbols-outlined text-base text-primary">picture_as_pdf</span>
          ${escapeHtml(pdpText('pdp_lab_download', pdpCopy('تحميل التقرير', 'Download report')))}
        </button>
      </div>
      <div class="pdp-lab-grid">
        <div class="pdp-vital">
          <div class="pdp-ring">
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e8ea" stroke-width="3.5"></path>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#005338" stroke-dasharray="${battery}, 100" stroke-width="3.5"></path>
            </svg>
            <b>${battery}%</b>
          </div>
          <div>
            <small>${escapeHtml(pdpText('pdp_lab_battery', pdpCopy('صحة البطارية', 'Battery health')))}</small>
            <strong>${escapeHtml(pdpCopy('ممتازة (أصلية)', 'Excellent original'))}</strong>
          </div>
        </div>
        <div class="pdp-vital">
          <span class="material-symbols-outlined text-primary">screenshot</span>
          <div>
            <small>${escapeHtml(pdpCopy('الشاشة', 'Display'))}</small>
            <strong>${escapeHtml(pdpCopy(product.inspection.screenAr, product.inspection.screenEn))}</strong>
          </div>
        </div>
        <div class="pdp-vital">
          <span class="material-symbols-outlined text-tertiary">photo_camera</span>
          <div>
            <small>${escapeHtml(pdpCopy('التصوير', 'Camera'))}</small>
            <strong>${escapeHtml(pdpCopy(product.inspection.cameraAr, product.inspection.cameraEn))}</strong>
          </div>
        </div>
        <div class="pdp-vital">
          <span class="material-symbols-outlined">lock_open</span>
          <div>
            <small>${escapeHtml(pdpCopy('الحالة النظامية', 'Status'))}</small>
            <strong>${escapeHtml(pdpCopy(product.inspection.simAr, product.inspection.simEn))}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

function pdpRemaining(product) {
  if (typeof StoreState !== 'undefined' && StoreState.remainingForBuyer) {
    return StoreState.remainingForBuyer(product.id);
  }
  return Number(product.stock || 0);
}

function renderBuyBox(product) {
  const price = currentPrice(product);
  const oldPrice = currentOldPrice(product);
  const saved = oldPrice && oldPrice > price ? oldPrice - price : 0;
  const installment = (price / 4).toFixed(2);
  const color = product.colors[pdpState.colorIndex];
  const warehouse = Number(product.stock || 0);
  const remaining = pdpRemaining(product);
  const buyable = remaining > 0;
  return `
    <div class="pdp-buybox">
      <div class="pdp-meta">
        <span class="pdp-pill">${escapeHtml(getLocalizedValue(product, 'series'))}</span>
        ${warehouse <= 0
          ? `<span class="pdp-stock is-out">${escapeHtml(pdpCopy('نفد من المخزن', 'Out of stock'))}</span>`
          : `<span class="pdp-stock ${warehouse <= 3 ? 'is-low' : ''}"><i></i>${escapeHtml(pdpCopy(`متوفر في المخزن: تبقى ${warehouse}`, `${warehouse} left in warehouse`))}</span>`}
      </div>
      <h1 class="pdp-title">${escapeHtml(getLocalizedValue(product, 'name'))}</h1>
      <p class="pdp-sub">${escapeHtml(getLocalizedValue(product, 'subtitle') || getLocalizedValue(product, 'extra'))}</p>
      <div class="pdp-rating">
        <div class="flex">${starsRow(5)}</div>
        <strong class="font-mono">${escapeHtml(product.rating)}</strong>
        <a href="#pdp-tabs" data-pdp-action="tab" data-tab="reviews">(${escapeHtml(String(product.reviews))} ${escapeHtml(pdpText('pdp_reviews_count', pdpCopy('تقييم', 'reviews')))})</a>
      </div>
      <div class="pdp-price-row">
        <div class="pdp-price">${Number(price).toLocaleString()} <span>${escapeHtml(pdpCurrency(product))}</span></div>
        ${oldPrice ? `<span class="pdp-old">${formatMoney(oldPrice, product)}</span>` : ''}
        ${saved ? `<span class="pdp-save">${escapeHtml(pdpText('pdp_save', pdpCopy('وفر', 'Save')))} ${saved.toLocaleString()}</span>` : ''}
      </div>

      ${product.variants.length > 1 ? `
        <div class="pdp-block">
          <div class="pdp-label">
            <span>${escapeHtml(pdpText('pdp_condition', pdpCopy('اختر حالة الجهاز', 'Choose condition')))}</span>
            <button type="button" class="pdp-link" data-pdp-action="grade">${escapeHtml(pdpText('pdp_grade_guide', pdpCopy('دليل التصنيف', 'Grade guide')))}</button>
          </div>
          <div class="pdp-conditions">
            ${product.variants.map((item) => `
              <button type="button" class="pdp-choice ${pdpState.condition === item.type ? 'is-active' : ''}" data-pdp-action="condition" data-condition="${escapeHtml(item.type)}">
                ${item.tagAr || item.tagEn ? `<span class="pdp-choice-tag">${escapeHtml(pdpCopy(item.tagAr, item.tagEn))}</span>` : ''}
                <strong class="block text-sm">${escapeHtml(pdpCopy(item.labelAr, item.labelEn))}</strong>
                <span class="block text-[11px] text-secondary mt-1">${item.type === 'refurbished' ? escapeHtml(pdpCopy('فحص 40 نقطة وملحقات معتمدة', '40-point check and certified extras')) : escapeHtml(pdpCopy('كرتون المصنع مع ضمان الوكيل', 'Factory sealed with authorized warranty'))}</span>
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${product.colors.length ? `
        <div class="pdp-block">
          <div class="pdp-label">
            <span>${escapeHtml(pdpText('pdp_color', pdpCopy('اللون المحدد', 'Selected color')))}: <span class="text-primary">${escapeHtml(color ? pdpCopy(color.nameAr, color.nameEn) : '')}</span></span>
          </div>
          <div class="pdp-colors">
            ${product.colors.map((item, index) => `
              <button type="button" class="pdp-swatch ${index === pdpState.colorIndex ? 'is-active' : ''}" style="background:${escapeHtml(item.hex)}" data-pdp-action="color" data-index="${index}" aria-label="${escapeHtml(pdpCopy(item.nameAr, item.nameEn))}"></button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${product.storageOptions.length ? `
        <div class="pdp-block">
          <div class="pdp-label">
            <span>${escapeHtml(pdpText('pdp_storage', pdpCopy('السعة التخزينية', 'Storage')))}</span>
          </div>
          <div class="pdp-storage">
            ${product.storageOptions.map((item, index) => `
              <button type="button" class="pdp-storage-btn ${index === pdpState.storageIndex ? 'is-active' : ''}" data-pdp-action="storage" data-index="${index}">
                ${escapeHtml(pdpCopy(item.labelAr, item.labelEn))}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="pdp-pay">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <strong class="text-sm">${escapeHtml(pdpText('pdp_installment', pdpCopy('التقسيط الميسر بدون فوائد', 'Interest-free installments')))}</strong>
          <span class="text-[10px] font-bold flex gap-1">
            <span class="bg-[#2eec96]/20 text-[#006039] px-2 py-0.5 rounded">Tabby</span>
            <span class="bg-[#ff9e58]/20 text-[#8c3d00] px-2 py-0.5 rounded">Tamara</span>
          </span>
        </div>
        <p class="text-xs text-secondary mt-1">
          ${escapeHtml(pdpText('pdp_installment_desc', pdpCopy('4 دفعات بقيمة', '4 payments of')))}
          <strong class="text-primary font-mono"> ${Number(installment).toLocaleString()} ${escapeHtml(pdpCurrency(product))}</strong>
        </p>
      </div>

      <div class="pdp-qty" ${!buyable ? 'hidden' : ''}>
        <span>${escapeHtml(pdpCopy('الكمية', 'Quantity'))}</span>
        <div>
          <button type="button" data-pdp-action="qty" data-delta="-1" ${pdpState.qty <= 1 ? 'disabled' : ''}>-</button>
          <strong>${escapeHtml(pdpState.qty)}</strong>
          <button type="button" data-pdp-action="qty" data-delta="1" ${pdpState.qty >= remaining ? 'disabled' : ''}>+</button>
        </div>
        <small>${escapeHtml(pdpCopy(`يمكنك طلب ${remaining} كحد أقصى حسب المخزن`, `You can order up to ${remaining} based on warehouse stock`))}</small>
      </div>
      ${warehouse > 0 && remaining <= 0 ? `<p class="pdp-stock is-low">${escapeHtml(pdpCopy('الكمية المتاحة موجودة بالفعل في سلتك.', 'The available quantity is already in your cart.'))}</p>` : ''}

      <div class="pdp-actions">
        <button type="button" class="pdp-btn pdp-btn-cart" data-pdp-action="cart" ${!buyable ? 'disabled' : ''}>
          <span class="material-symbols-outlined">add_shopping_cart</span>
          ${escapeHtml(!buyable ? pdpCopy('غير متوفر', 'Unavailable') : pdpText('pdp_add_cart', pdpCopy('إضافة إلى السلة', 'Add to cart')))}
        </button>
        <button type="button" class="pdp-btn pdp-btn-buy" data-pdp-action="buy" ${!buyable ? 'disabled' : ''}>
          <span class="material-symbols-outlined">bolt</span>
          ${escapeHtml(pdpText('pdp_buy_now', pdpCopy('شراء فوري', 'Buy now')))}
        </button>
      </div>

      <div class="pdp-perks">
        <div>
          <span class="material-symbols-outlined text-tertiary">schedule_send</span>
          <strong>${escapeHtml(pdpText('pdp_perk_ship', pdpCopy('توصيل سريع', 'Fast delivery')))}</strong>
          <span>${escapeHtml(pdpCopy('خلال 24-48 ساعة', 'Within 24-48 hours'))}</span>
        </div>
        <div>
          <span class="material-symbols-outlined text-primary">published_with_changes</span>
          <strong>${escapeHtml(pdpText('pdp_perk_return', pdpCopy('استرجاع سهل', 'Easy returns')))}</strong>
          <span>${escapeHtml(pdpCopy('14 يوماً', '14 days'))}</span>
        </div>
        <div>
          <span class="material-symbols-outlined text-tertiary">loyalty</span>
          <strong>${escapeHtml(pdpText('pdp_perk_points', pdpCopy('نقاط ولاء', 'Loyalty points')))}</strong>
          <span>${escapeHtml(pdpCopy('تُضاف فوراً', 'Added instantly'))}</span>
        </div>
      </div>
    </div>
  `;
}

function renderBundle(product) {
  if (!product.accessories.length) return '';
  const total = bundleTotal(product);
  const original = product.accessories.reduce((sum, item) => sum + Number(item.price), 0);
  return `
    <section class="pdp-panel">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span class="text-[11px] text-primary font-bold">${escapeHtml(pdpText('pdp_bundle_kicker', pdpCopy('حزمة التوفير الذكية', 'Smart bundle')))}</span>
          <h2 class="text-lg font-black mt-0.5">${escapeHtml(pdpText('pdp_bundle_title', pdpCopy('منتجات تُشترى غالباً معه', 'Frequently bought together')))}</h2>
        </div>
        <span class="pdp-save">${escapeHtml(pdpText('pdp_bundle_save', pdpCopy('خصم 15% على الحزمة', '15% off the bundle')))}</span>
      </div>
      <div class="pdp-bundle-grid">
        ${product.accessories.map((item) => `
          <label class="pdp-bundle-item">
            <input type="checkbox" data-pdp-action="bundle" data-id="${escapeHtml(item.id)}" ${pdpState.bundle[item.id] === false ? '' : 'checked'}>
            <img alt="${escapeHtml(pdpCopy(item.nameAr, item.nameEn))}" src="${escapeHtml(safeMediaUrl(item.image, STOREFRONT_PLACEHOLDER_IMAGE))}">
            <span>
              <strong class="block text-sm">${escapeHtml(pdpCopy(item.nameAr, item.nameEn))}</strong>
              <small class="text-secondary">${escapeHtml(pdpCopy(item.extraAr, item.extraEn))}</small>
              <b class="block text-primary font-mono text-sm mt-0.5">${formatMoney(item.price, product)}</b>
            </span>
          </label>
        `).join('')}
        <div class="pdp-bundle-item flex-col items-stretch justify-between">
          <div>
            <small class="text-secondary">${escapeHtml(pdpText('pdp_bundle_total', pdpCopy('سعر الحزمة بعد الخصم', 'Bundle price after discount')))}</small>
            <div class="flex items-baseline gap-2 mt-1">
              <strong class="text-xl font-black font-mono">${formatMoney(Math.round(total * 0.85), product)}</strong>
              <span class="pdp-old">${formatMoney(original, product)}</span>
            </div>
          </div>
          <button type="button" class="pdp-btn pdp-btn-buy w-full mt-3 min-h-10 text-sm" data-pdp-action="bundle-cart">
            ${escapeHtml(pdpText('pdp_bundle_add', pdpCopy('إضافة الحزمة للسلة', 'Add bundle to cart')))}
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderTabs(product) {
  const tabs = [
    ['specs', pdpText('pdp_tab_specs', pdpCopy('المواصفات', 'Specifications')), 'tune'],
    ['reviews', `${pdpText('pdp_tab_reviews', pdpCopy('المراجعات', 'Reviews'))} (${product.reviews})`, 'reviews'],
    ['warranty', pdpText('pdp_tab_warranty', pdpCopy('الضمان والاستبدال', 'Warranty & returns')), 'verified']
  ];
  return `
    <section class="pdp-panel pdp-tabs" id="pdp-tabs">
      <div class="pdp-tablist" role="tablist">
        ${tabs.map(([id, label, icon]) => `
          <button type="button" class="pdp-tab ${pdpState.tab === id ? 'is-active' : ''}" data-pdp-action="tab" data-tab="${id}">
            <span class="material-symbols-outlined text-lg">${icon}</span>${escapeHtml(label)}
          </button>
        `).join('')}
      </div>
      <div class="pdp-tabpanel">
        ${pdpState.tab === 'specs' ? renderSpecs(product) : ''}
        ${pdpState.tab === 'reviews' ? renderReviews(product) : ''}
        ${pdpState.tab === 'warranty' ? renderWarranty() : ''}
      </div>
    </section>
  `;
}

function renderSpecs(product) {
  return `
    <div class="pdp-spec-grid">
      ${product.specs.map((group) => `
        <div>
          <h3 class="font-black flex items-center gap-2 pb-2 mb-2 border-b border-outline-variant/15">
            <span class="material-symbols-outlined text-primary">${escapeHtml(group.icon || 'tune')}</span>
            ${escapeHtml(pdpCopy(group.titleAr, group.titleEn))}
          </h3>
          ${(group.rows || []).map((row) => `
            <div class="pdp-spec-row">
              <span>${escapeHtml(pdpCopy(row.labelAr, row.labelEn))}</span>
              <b>${escapeHtml(pdpCopy(row.valueAr, row.valueEn))}</b>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

function renderReviews(product) {
  const five = Math.round((Number(product.rating) / 5) * 100);
  return `
    <div class="pdp-review-grid">
      <aside class="pdp-review-card text-center">
        <div class="text-4xl font-black text-primary font-mono">${escapeHtml(product.rating)}</div>
        <div class="flex justify-center my-2">${starsRow(5)}</div>
        <p class="text-xs text-secondary mb-4">${escapeHtml(pdpCopy(`بناءً على ${product.reviews} تقييماً موثقاً`, `Based on ${product.reviews} verified reviews`))}</p>
        <div class="space-y-2 text-[11px] text-start mb-4">
          <div class="flex items-center gap-2"><span class="w-12">5</span><div class="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden"><div class="h-full bg-primary" style="width:${five}%"></div></div></div>
          <div class="flex items-center gap-2"><span class="w-12">4</span><div class="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden"><div class="h-full bg-primary" style="width:${Math.max(4, 100 - five)}%"></div></div></div>
        </div>
        <button type="button" class="pdp-btn pdp-btn-buy w-full text-sm min-h-10" data-pdp-action="write-review">${escapeHtml(pdpText('pdp_write_review', pdpCopy('كتابة مراجعة', 'Write a review')))}</button>
      </aside>
      <div class="space-y-3">
        ${product.reviewsList.map((review) => `
          <article class="pdp-review-card">
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center">${escapeHtml(review.initial)}</div>
                <div>
                  <strong class="block text-sm">${escapeHtml(pdpCopy(review.nameAr, review.nameEn))}</strong>
                  ${review.verified ? `<small class="text-tertiary font-bold">${escapeHtml(pdpCopy('مشترٍ موثق', 'Verified buyer'))}</small>` : ''}
                </div>
              </div>
              <span class="text-[11px] text-secondary">${escapeHtml(pdpCopy(review.dateAr, review.dateEn))}</span>
            </div>
            <div class="flex mb-2">${starsRow(review.stars || 5)}</div>
            <p class="text-sm text-secondary leading-relaxed">${escapeHtml(pdpCopy(review.textAr, review.textEn))}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderWarranty() {
  const cards = [
    ['verified_user', pdpText('pdp_warranty_1_title', pdpCopy('ضمان ذهبي', 'Gold warranty')), pdpText('pdp_warranty_1_desc', pdpCopy('صيانة الأعطال المصنعية مع جهاز بديل إذا تجاوز الإصلاح 48 ساعة.', 'Factory-fault coverage with a replacement if repair exceeds 48 hours.'))],
    ['sync_alt', pdpText('pdp_warranty_2_title', pdpCopy('استبدال خلال 14 يوماً', '14-day replacement')), pdpText('pdp_warranty_2_desc', pdpCopy('استرجاع أو استبدال مرن وفق حقوق حماية المستهلك.', 'Flexible return or replacement under consumer rights.'))],
    ['build_circle', pdpText('pdp_warranty_3_title', pdpCopy('قطع أصلية', 'Original parts')), pdpText('pdp_warranty_3_desc', pdpCopy('فحص مختص مع إتاحة تقرير الحالة عند الاستلام.', 'Specialist inspection and a condition report on delivery.'))]
  ];
  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      ${cards.map(([icon, title, desc]) => `
        <article class="pdp-warranty-card">
          <span class="material-symbols-outlined text-3xl text-primary">${icon}</span>
          <h3 class="font-black mt-2 mb-1">${escapeHtml(title)}</h3>
          <p class="text-sm text-secondary leading-relaxed">${escapeHtml(desc)}</p>
        </article>
      `).join('')}
    </div>
  `;
}

function renderRelated(product) {
  if (!product.related.length) return '';
  return `
    <section class="pdp-panel">
      <h2 class="text-lg font-black mb-4">${escapeHtml(pdpText('pdp_related', pdpCopy('منتجات مشابهة', 'Related products')))}</h2>
      <div class="pdp-related">
        ${product.related.map((item) => `
          <a href="${escapeHtml(getProductPageUrl(item.id))}">
            <img alt="${escapeHtml(getLocalizedValue(item, 'name'))}" src="${escapeHtml(safeMediaUrl(item.image, STOREFRONT_PLACEHOLDER_IMAGE))}">
            <strong class="block text-sm line-clamp-2 min-h-[2.6rem]">${escapeHtml(getLocalizedValue(item, 'name'))}</strong>
            <span class="block text-primary font-black font-mono mt-2">${formatMoney(item.price, item)}</span>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

function renderProductPage() {
  const root = document.getElementById('pdp-root');
  if (!root) return;
  const product = pdpState.product;
  updateDemoNotice(pdpState.usingDemo);

  if (!product) {
    document.title = pdpText('pdp_not_found_title', 'Product not found') + ' | TechPro';
    root.innerHTML = renderNotFound();
    return;
  }

  const name = getLocalizedValue(product, 'name');
  document.title = `${name} | تيك برو TechPro`;
  root.innerHTML = `
    <div class="pdp-shell">
      ${renderBreadcrumb(product)}
      <div class="pdp-hero">
        ${renderGallery(product)}
        ${renderBuyBox(product)}
      </div>
      ${renderBundle(product)}
      ${renderTabs(product)}
      ${renderRelated(product)}
    </div>
  `;
  renderConditionModal();
}

function renderConditionModal() {
  const host = document.getElementById('pdp-modal-root');
  if (!host) return;
  host.innerHTML = `
    <div id="condition-modal" class="pdp-modal" role="dialog" aria-modal="true" aria-labelledby="pdp-grade-title">
      <div class="pdp-modal-card">
        <div class="flex items-center justify-between mb-4">
          <h3 id="pdp-grade-title" class="font-black">${escapeHtml(pdpText('pdp_grade_title', pdpCopy('معايير تصنيف درجات الأجهزة', 'Device grade guide')))}</h3>
          <button type="button" class="pdp-icon-btn" data-pdp-action="grade" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-3 text-sm">
          <div class="pdp-review-card">
            <strong class="text-primary block mb-1">${escapeHtml(pdpCopy('جديد كلياً', 'Brand new sealed'))}</strong>
            <p class="text-secondary">${escapeHtml(pdpCopy('كرتونة المصنع المبرشمة مع ضمان الوكيل سنتين.', 'Factory-sealed box with a two-year authorized warranty.'))}</p>
          </div>
          <div class="pdp-review-card">
            <strong class="text-tertiary block mb-1">${escapeHtml(pdpCopy('مجدد معتمد Grade A+', 'Certified Grade A+'))}</strong>
            <p class="text-secondary">${escapeHtml(pdpCopy('40 اختباراً مخبرياً، بطارية 95%+، وضمان تيك برو.', '40 lab tests, 95%+ battery, and TechPro warranty.'))}</p>
          </div>
        </div>
        <button type="button" class="pdp-btn pdp-btn-buy w-full mt-4 text-sm" data-pdp-action="grade">${escapeHtml(pdpText('pdp_grade_ok', pdpCopy('فهمت ذلك', 'Got it')))}</button>
      </div>
    </div>
  `;
}

function notify(message, type) {
  if (typeof showToast === 'function') showToast(message, type || 'success');
}

function handlePdpClick(event) {
  const trigger = event.target.closest('[data-pdp-action]');
  if (!trigger || !pdpState.product) return;
  const action = trigger.dataset.pdpAction;
  const product = pdpState.product;

  if (action === 'qty') {
    const stock = pdpRemaining(product);
    pdpState.qty = Math.min(stock, Math.max(1, Number(pdpState.qty || 1) + Number(trigger.dataset.delta)));
    renderProductPage();
    return;
  }
  if (action === 'gallery') pdpState.galleryIndex = Number(trigger.dataset.index);
  if (action === 'condition') pdpState.condition = trigger.dataset.condition;
  if (action === 'color') pdpState.colorIndex = Number(trigger.dataset.index);
  if (action === 'storage') pdpState.storageIndex = Number(trigger.dataset.index);
  if (action === 'tab') {
    pdpState.tab = trigger.dataset.tab;
    renderProductPage();
    document.getElementById('pdp-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (action === 'bundle') {
    pdpState.bundle[trigger.dataset.id] = trigger.checked;
  }
  if (action === 'grade') {
    toggleConditionDialog();
    return;
  }
  if (action === 'wishlist') {
    const snapshot = { isDemo: product.isDemo === true, stock: product.stock, nameAr: product.nameAr, nameEn: product.nameEn, image: product.image, price: currentPrice(product), oldPrice: currentOldPrice(product) };
    const added = typeof toggleWishlist === 'function' ? toggleWishlist(product.id, snapshot) : addToWishlist(product.id, snapshot);
    notify(added ? pdpCopy('تمت إضافة المنتج إلى المفضلة.', 'Product added to wishlist.') : pdpCopy('تمت إزالة المنتج من المفضلة.', 'Removed from wishlist.'), added ? 'success' : 'info');
  }
  if (action === 'share') {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: getLocalizedValue(product, 'name'), url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => notify(pdpCopy('تم نسخ رابط المنتج.', 'Product link copied.'), 'info'));
    }
    return;
  }
  if (action === 'cart' || action === 'buy') {
    if (pdpRemaining(product) <= 0) {
      notify(pdpCopy('هذا الجهاز نفد من المخزن.', 'This device is out of stock.'), 'error');
      return;
    }
    const color = product.colors[pdpState.colorIndex];
    const storage = activeStorage(product);
    const variant = activeVariant(product);
    if (typeof addToCart === 'function') {
      const added = addToCart(typeof buildCartPayload === 'function' ? buildCartPayload(product, {
        price: currentPrice(product),
        oldPrice: currentOldPrice(product),
        qty: pdpState.qty || 1,
        conditionAr: variant && variant.labelAr,
        conditionEn: variant && variant.labelEn,
        colorAr: color && color.nameAr,
        colorEn: color && color.nameEn,
        storage: storage ? storage.id : product.storageGb
      }) : { productId: product.id, price: currentPrice(product), qty: pdpState.qty || 1, nameAr: product.nameAr, nameEn: product.nameEn, image: product.image });
      if (added === false) { notify(pdpCopy('الكمية المطلوبة غير متوفرة.', 'Requested quantity is unavailable.'), 'error'); return; }
    }
    notify(action === 'buy'
      ? pdpCopy('تمت إضافة المنتج وجارٍ تجهيز الطلب.', 'Added to cart. Preparing checkout.')
      : pdpCopy('تمت إضافة المنتج إلى السلة بنجاح.', 'Product added to cart.'));
    if (action === 'buy') {
      window.location.href = typeof getStorefrontPageUrl === 'function' ? getStorefrontPageUrl('checkout.html') : 'checkout.html';
      return;
    }
  }
  if (action === 'bundle-cart') {
    product.accessories.forEach((item) => {
      if (pdpState.bundle[item.id] === false) return;
      if (typeof addToCart === 'function') {
        addToCart({
          productId: `bundle-${product.id}-${item.id}`,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          image: item.image,
          price: Math.round(Number(item.price) * 0.85),
          qty: 1
        });
      }
    });
    notify(pdpCopy('تمت إضافة الحزمة بخصم 15%.', 'Bundle added with 15% off.'));
  }
  if (action === 'report') {
    notify(pdpCopy('تقرير الفحص غير متاح للتنزيل بعد.', 'The inspection report is not available for download yet.'), 'info');
    return;
  }
  if (action === 'write-review') {
    notify(pdpCopy('خدمة إضافة التقييم غير مربوطة بعد.', 'Review submission is not connected yet.'), 'info');
    return;
  }

  renderProductPage();
}

async function loadCatalogFromApi() {
  try { return apiList(await requestApi('catalog/products')).map(normalizeProduct); }
  catch { return null; }
}
async function loadProductFromApi(id) {
  try {
    const data = await requestApi(`products/${encodeURIComponent(id)}`);
    const raw = data.product || data.data || data;
    if (!raw || raw.id == null) throw new Error('Invalid product');
    return normalizePdpProduct(raw);
  } catch { return null; }
}

function demoCatalog() {
  return Array.isArray(window.STOREFRONT_DEMO_PRODUCTS) ? window.STOREFRONT_DEMO_PRODUCTS
    : (typeof STOREFRONT_DEMO_PRODUCTS !== 'undefined' ? STOREFRONT_DEMO_PRODUCTS : []);
}

function readRequestedId() {
  return new URLSearchParams(window.location.search).get('id')
    || new URLSearchParams(window.location.search).get('product');
}

async function initProductPage() {
  const requestedId = readRequestedId();
  const apiCatalog = await loadCatalogFromApi();
  pdpState.catalog = apiCatalog || (isDemoMode() ? demoCatalog() : []);
  pdpState.usingDemo = !apiCatalog;
  if (typeof StoreState !== 'undefined') {
    StoreState.syncFromCatalog(pdpState.catalog);
    pdpState.catalog = pdpState.catalog.map((item) => StoreState.applyLiveProduct(item));
  }

  let product = null;
  if (requestedId) {
    const apiProduct = await loadProductFromApi(requestedId);
    if (apiProduct) {
      product = apiProduct;
      pdpState.usingDemo = false;
    } else {
      product = pdpState.catalog.find((item) => String(item.id) === String(requestedId)) || null;
    }
  } else {
    product = pdpState.catalog[0] || null;
  }

  if (product) {
    const live = typeof StoreState !== 'undefined' ? StoreState.applyLiveProduct(product) : product;
    pdpState.product = enrichPdpProduct(live, pdpState.catalog);
    pdpState.qty = 1;
    pdpState.condition = listingTypeOf(pdpState.product);
    const matchStorage = pdpState.product.storageOptions.findIndex((item) => Number(item.id) === Number(product.storageGb));
    pdpState.storageIndex = matchStorage >= 0 ? matchStorage : 0;
    pdpState.galleryIndex = 0;
    pdpState.colorIndex = 0;
    pdpState.tab = 'specs';
    pdpState.bundle = {};
  } else {
    pdpState.product = null;
  }

  renderProductPage();
}

document.addEventListener('click', handlePdpClick);
window.addEventListener('languageChanged', () => {
  if (pdpState.product) {
    pdpState.product = enrichPdpProduct(pdpState.product, pdpState.catalog);
  }
  renderProductPage();
});

onStorefrontReady(initProductPage);

let conditionDialogTrigger = null;
function toggleConditionDialog() {
  const modal = document.getElementById('condition-modal');
  if (!modal) return;
  const opening = !modal.classList.contains('is-open');
  modal.classList.toggle('is-open', opening);
  if (opening) { conditionDialogTrigger = document.activeElement; modal.querySelector('button')?.focus(); }
  else conditionDialogTrigger?.focus();
}
document.addEventListener('keydown', event => {
  const modal = document.getElementById('condition-modal');
  if (!modal?.classList.contains('is-open')) return;
  if (event.key === 'Escape') { event.preventDefault(); toggleConditionDialog(); }
  if (event.key !== 'Tab') return;
  const targets = modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]');
  const first = targets[0], last = targets[targets.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});
