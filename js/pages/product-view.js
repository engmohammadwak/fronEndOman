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

