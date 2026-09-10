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

