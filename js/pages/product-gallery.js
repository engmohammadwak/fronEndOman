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

