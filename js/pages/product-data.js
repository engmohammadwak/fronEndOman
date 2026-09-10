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

