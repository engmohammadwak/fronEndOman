function productForm(product) {
  const item = product || {
    id: '', nameAr: '', nameEn: '', brand: 'Apple', price: 0, oldPrice: '', stock: 5,
    listingType: 'new', sku: '', image: '', extraAr: '', extraEn: '', category: 'phones', active: true
  };
  return `
    <h2 style="margin-top:0">${escapeAdmin(product ? t('edit') : t('add'))}</h2>
    <form id="product-form" class="ad-grid-2">
      <input type="hidden" name="id" value="${escapeAdmin(item.id)}">
      <div class="ad-field"><label>${escapeAdmin(t('nameAr'))}</label><input name="nameAr" required value="${escapeAdmin(item.nameAr)}"></div>
      <div class="ad-field"><label>${escapeAdmin(t('nameEn'))}</label><input name="nameEn" required value="${escapeAdmin(item.nameEn)}"></div>
      <div class="ad-field"><label>${escapeAdmin(t('brandName'))}</label><input name="brand" value="${escapeAdmin(item.brand || '')}"></div>
      <div class="ad-field"><label>SKU</label><input name="sku" value="${escapeAdmin(item.sku || '')}"></div>
      <div class="ad-field"><label>${escapeAdmin(t('price'))}</label><input name="price" type="number" min="0" step="0.01" required value="${escapeAdmin(item.price)}"></div>
      <div class="ad-field"><label>${escapeAdmin(adminLang() === 'en' ? 'Old price' : 'السعر السابق')}</label><input name="oldPrice" type="number" min="0" step="0.01" value="${escapeAdmin(item.oldPrice || '')}"></div>
      <div class="ad-field"><label>${escapeAdmin(t('stock'))}</label><input name="stock" type="number" min="0" required value="${escapeAdmin(item.stock)}"></div>
      <div class="ad-field"><label>${escapeAdmin(t('condition'))}</label>
        <select name="listingType">
          <option value="new" ${item.listingType !== 'refurbished' ? 'selected' : ''}>${escapeAdmin(t('new'))}</option>
          <option value="refurbished" ${item.listingType === 'refurbished' ? 'selected' : ''}>${escapeAdmin(t('refurbished'))}</option>
        </select>
      </div>
      <div class="ad-field"><label>${escapeAdmin(t('active'))}</label>
        <select name="active">
          <option value="1" ${item.active !== false ? 'selected' : ''}>${escapeAdmin(t('active'))}</option>
          <option value="0" ${item.active === false ? 'selected' : ''}>${escapeAdmin(t('hidden'))}</option>
        </select>
      </div>
      <div class="ad-field" style="grid-column:1/-1"><label>${escapeAdmin(t('image'))}</label><input name="image" value="${escapeAdmin(item.image || '')}"></div>
      <div class="ad-field"><label>${escapeAdmin(adminLang() === 'en' ? 'Arabic extra' : 'وصف إضافي عربي')}</label><input name="extraAr" value="${escapeAdmin(item.extraAr || '')}"></div>
      <div class="ad-field"><label>${escapeAdmin(adminLang() === 'en' ? 'English extra' : 'وصف إضافي إنجليزي')}</label><input name="extraEn" value="${escapeAdmin(item.extraEn || '')}"></div>
      <div class="admin-actions" style="grid-column:1/-1">
        <button class="ad-btn" type="submit">${escapeAdmin(t('save'))}</button>
        <button class="ad-ghost" type="button" data-close-modal>${escapeAdmin(t('cancel'))}</button>
      </div>
    </form>
  `;
}

function bindProductForm(existing) {
  document.querySelector('[data-close-modal]')?.addEventListener('click', closeAdminModal);
  document.getElementById('product-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    StoreState.upsertProduct({
      ...(existing || {}),
      id: data.get('id') || Date.now(),
      nameAr: data.get('nameAr'),
      nameEn: data.get('nameEn'),
      brand: data.get('brand'),
      sku: data.get('sku') || `TP-${Date.now()}`,
      price: Number(data.get('price')),
      oldPrice: data.get('oldPrice') ? Number(data.get('oldPrice')) : '',
      stock: Number(data.get('stock')),
      listingType: data.get('listingType'),
      condition: data.get('listingType'),
      image: data.get('image'),
      extraAr: data.get('extraAr'),
      extraEn: data.get('extraEn'),
      category: existing?.category || 'phones',
      active: data.get('active') === '1',
      isDemo: true
    });
    closeAdminModal();
    adminToast(t('saved'));
    window.renderAdminPage();
  });
}

function renderOverview() {
  const kpi = StoreState.kpis();
  const orders = StoreState.getOrders().slice(0, 6);
  const settings = StoreState.getSettings();
  const alerts = StoreState.getProducts().filter((item) => Number(item.stock) <= Number(settings.lowStock || 3));
  mountAdmin(`
    <div class="kpi-grid">
      <article class="kpi">
        <span class="material-symbols-outlined">payments</span>
        <span>${escapeAdmin(t('sales'))}</span>
        <strong>${escapeAdmin(money(kpi.sales))}</strong>
      </article>
      <article class="kpi">
        <span class="material-symbols-outlined">receipt_long</span>
        <span>${escapeAdmin(t('openOrders'))}</span>
        <strong>${kpi.openOrders} / ${kpi.orders}</strong>
      </article>
      <article class="kpi ${kpi.lowStock ? 'warn' : ''}">
        <span class="material-symbols-outlined">inventory_2</span>
        <span>${escapeAdmin(t('units'))}</span>
        <strong>${kpi.units}</strong>
        <small>${kpi.lowStock} ${escapeAdmin(t('low'))} · ${kpi.outOfStock} ${escapeAdmin(t('out'))}</small>
      </article>
      <article class="kpi">
        <span class="material-symbols-outlined">favorite</span>
        <span>${escapeAdmin(t('wishlist'))}</span>
        <strong>${kpi.wishlist}</strong>
      </article>
    </div>
    <div class="ad-split">
      <div class="ad-card">
        <h2>${escapeAdmin(t('recent'))}</h2>
        ${ordersTable(orders)}
      </div>
      <div class="ad-card">
        <h2>${escapeAdmin(t('alerts'))}</h2>
        ${alerts.length ? alerts.map((item) => `
          <div class="ad-alert">
            <strong>${escapeAdmin(adminLang() === 'en' ? item.nameEn : item.nameAr)}</strong>
            <span class="ad-chip ${Number(item.stock) <= 0 ? 'red' : 'amber'}">${escapeAdmin(item.stock)}</span>
          </div>
        `).join('') : `<p>${escapeAdmin(t('empty'))}</p>`}
      </div>
    </div>
  `);
  bindOrdersTable();
}

function productsTable(list) {
  if (!list.length) return `<p>${escapeAdmin(t('empty'))}</p>`;
  const low = Number(StoreState.getSettings().lowStock || 3);
  return `<div class="ad-table-wrap"><table class="ad-table">
    <thead><tr><th></th><th>${escapeAdmin(t('nameAr'))}</th><th>${escapeAdmin(t('price'))}</th><th>${escapeAdmin(t('stock'))}</th><th>${escapeAdmin(t('condition'))}</th><th>${escapeAdmin(t('actions'))}</th></tr></thead>
    <tbody>${list.map((item) => `
      <tr>
        <td><img alt="" src="${escapeAdmin(item.image || '')}"></td>
        <td><strong>${escapeAdmin(adminLang() === 'en' ? item.nameEn : item.nameAr)}</strong><div style="color:#94a3b8;font-size:.7rem">${escapeAdmin(item.sku || '')}</div></td>
        <td class="font-mono">${escapeAdmin(money(item.price))}</td>
        <td><span class="ad-chip ${Number(item.stock) <= 0 ? 'red' : (Number(item.stock) <= low ? 'amber' : 'green')}">${escapeAdmin(item.stock)}</span></td>
        <td>${escapeAdmin(item.listingType === 'refurbished' ? t('refurbished') : t('new'))}</td>
        <td>
          <button class="ad-ghost" data-edit-product="${escapeAdmin(item.id)}">${escapeAdmin(t('edit'))}</button>
          <button class="ad-danger" data-del-product="${escapeAdmin(item.id)}">${escapeAdmin(t('delete'))}</button>
        </td>
      </tr>
    `).join('')}</tbody>
  </table></div>`;
}

function renderProducts() {
  const q = (document.getElementById('admin-search')?.value || '').trim().toLowerCase();
  const list = StoreState.getProducts().filter((item) => {
    const hay = `${item.nameAr} ${item.nameEn} ${item.brand} ${item.sku}`.toLowerCase();
    return !q || hay.includes(q);
  });
  mountAdmin(`
    <div class="admin-actions" style="margin-bottom:1rem">
      <input id="admin-search" class="ad-search" placeholder="${escapeAdmin(t('search'))}" value="${escapeAdmin(q)}">
      <button class="ad-btn" id="add-product">${escapeAdmin(t('add'))}</button>
    </div>
    <div class="ad-card">${productsTable(list)}</div>
  `);
  document.getElementById('admin-search')?.addEventListener('input', () => renderProducts());
  document.getElementById('add-product')?.addEventListener('click', () => {
    adminModal(productForm(null));
    bindProductForm(null);
  });
  document.querySelectorAll('[data-edit-product]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = StoreState.getProduct(btn.dataset.editProduct);
      adminModal(productForm(product));
      bindProductForm(product);
    });
  });
  document.querySelectorAll('[data-del-product]').forEach((btn) => {
    btn.addEventListener('click', () => {
      StoreState.deleteProduct(btn.dataset.delProduct);
      adminToast(t('deleted'));
      renderProducts();
    });
  });
}

function renderInventory() {
  const settings = StoreState.getSettings();
  const products = StoreState.getProducts();
  mountAdmin(`
    <div class="kpi-grid" style="margin-bottom:1rem">
      <article class="kpi warn"><span>${escapeAdmin(t('low'))}</span><strong>${products.filter((item) => item.stock > 0 && item.stock <= settings.lowStock).length}</strong></article>
      <article class="kpi danger"><span>${escapeAdmin(t('out'))}</span><strong>${products.filter((item) => item.stock <= 0).length}</strong></article>
    </div>
    <div class="ad-card">${productsTable(products)}</div>
  `);
  document.querySelectorAll('[data-edit-product]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = StoreState.getProduct(btn.dataset.editProduct);
      adminModal(productForm(product));
      bindProductForm(product);
    });
  });
  document.querySelectorAll('[data-del-product]').forEach((btn) => btn.addEventListener('click', () => {
    StoreState.deleteProduct(btn.dataset.delProduct);
    renderInventory();
  }));
}

function ordersTable(orders) {
  if (!orders.length) return `<p>${escapeAdmin(t('empty'))}</p>`;
  return `<div class="ad-table-wrap"><table class="ad-table">
    <thead><tr><th>${escapeAdmin(t('orders'))}</th><th>${escapeAdmin(t('customer'))}</th><th>${escapeAdmin(t('total'))}</th><th>${escapeAdmin(t('status'))}</th><th>${escapeAdmin(t('actions'))}</th></tr></thead>
    <tbody>${orders.map((order) => `
      <tr>
        <td class="font-mono">#${escapeAdmin(order.orderId)}</td>
        <td>${escapeAdmin(order.customerName || '')}<div style="color:#94a3b8">${escapeAdmin(order.phone || '')}</div></td>
        <td>${escapeAdmin(money(order.total))}</td>
        <td>
          <select data-order-status="${escapeAdmin(order.orderId)}">
            ${['received', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => `
              <option value="${status}" ${(order.status === status || (!['received', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order.status) && status === 'processing')) ? 'selected' : ''}>${escapeAdmin(t(status))}</option>
            `).join('')}
          </select>
        </td>
        <td>
          ${order.phone ? `<a class="ad-wa" target="_blank" rel="noopener noreferrer" href="${escapeAdmin(customerWhatsApp(order))}">${escapeAdmin(t('whatsapp'))}</a>` : ''}
          <button class="ad-ghost" data-invoice="${escapeAdmin(order.orderId)}">${escapeAdmin(t('invoice'))}</button>
        </td>
      </tr>
    `).join('')}</tbody>
  </table></div>`;
}

function customerWhatsApp(order) {
  const phone = String(order.phone || '').replace(/\D/g, '');
  const message = adminLang() === 'en'
    ? `Hello ${order.customerName || ''}, your TechPro order #${order.orderId} is now: ${statusLabel(order.status)}.`
    : `مرحباً ${order.customerName || ''}، نود إبلاغك بأن طلبك رقم #${order.orderId} أصبح الآن: ${statusLabel(order.status)}.`;
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : '#';
}

function printInvoice(order) {
  const settings = StoreState.getSettings();
  const win = window.open('', '_blank', 'noopener,noreferrer,width=720,height=900');
  if (!win) return;
  const items = (order.items || []).map((item) => `<tr><td>${item.nameAr || item.nameEn || ''}</td><td>${item.qty || 1}</td><td>${item.price || 0}</td></tr>`).join('');
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${order.orderId}</title>
    <style>body{font-family:Cairo,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style></head>
    <body><h1>${settings.storeNameAr}</h1><p>#${order.orderId}</p><p>${order.customerName} - ${order.phone}</p>
    <table><tr><th>الصنف</th><th>الكمية</th><th>السعر</th></tr>${items}</table>
    <h2>${order.total} ${settings.currencyAr}</h2><p>فاتورة تجريبية غير ضريبية إلى حين ربط النظام المحاسبي.</p></body></html>`);
  win.document.close();
  win.focus();
}

function bindOrdersTable() {
  document.querySelectorAll('[data-order-status]').forEach((select) => {
    select.addEventListener('change', () => {
      StoreState.updateOrderStatus(select.dataset.orderStatus, select.value);
      adminToast(t('saved'));
      window.renderAdminPage();
    });
  });
  document.querySelectorAll('[data-invoice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const order = StoreState.getOrders().find((item) => item.orderId === btn.dataset.invoice);
      if (order) printInvoice(order);
    });
  });
}

function renderOrders() {
  mountAdmin(`<div class="ad-card">${ordersTable(StoreState.getOrders())}</div>`);
  bindOrdersTable();
}

function renderCustomers() {
  const customers = StoreState.getCustomers();
  mountAdmin(`<div class="ad-card">${customers.length ? `<table class="ad-table">
    <thead><tr><th>${escapeAdmin(t('customer'))}</th><th>${escapeAdmin(t('phone'))}</th><th>${escapeAdmin(t('orders'))}</th><th>${escapeAdmin(t('total'))}</th></tr></thead>
    <tbody>${customers.map((item) => `<tr><td>${escapeAdmin(item.name)}</td><td>${escapeAdmin(item.phone)}</td><td>${item.orders}</td><td>${escapeAdmin(money(item.total))}</td></tr>`).join('')}</tbody>
  </table>` : `<p>${escapeAdmin(t('empty'))}</p>`}</div>`);
}

function renderCoupons() {
  const list = StoreState.getCoupons();
  mountAdmin(`
    <div class="admin-actions" style="margin-bottom:1rem"><button class="ad-btn" id="add-coupon">${escapeAdmin(t('add'))}</button></div>
    <div class="ad-card">${list.length ? `<table class="ad-table">
      <thead><tr><th>${escapeAdmin(t('code'))}</th><th>${escapeAdmin(t('type'))}</th><th>${escapeAdmin(t('price'))}</th><th>${escapeAdmin(t('minOrder'))}</th><th>${escapeAdmin(t('expires'))}</th><th>${escapeAdmin(t('actions'))}</th></tr></thead>
      <tbody>${list.map((item) => `<tr>
        <td class="font-mono">${escapeAdmin(item.code)}</td>
        <td>${escapeAdmin(item.type === 'percent' ? t('percent') : t('fixed'))}</td>
        <td>${escapeAdmin(item.amount)}</td>
        <td>${escapeAdmin(item.minOrder || 0)}</td>
        <td>${escapeAdmin(item.expires || '')}</td>
        <td>
          <button class="ad-ghost" data-toggle-coupon="${item.id}">${escapeAdmin(item.active ? t('active') : t('hidden'))}</button>
          <button class="ad-danger" data-del-coupon="${item.id}">${escapeAdmin(t('delete'))}</button>
        </td>
      </tr>`).join('')}</tbody>
    </table>` : `<p>${escapeAdmin(t('empty'))}</p>`}</div>
  `);
  document.getElementById('add-coupon')?.addEventListener('click', () => {
    adminModal(`
      <h2>${escapeAdmin(t('add'))}</h2>
      <form id="coupon-form">
        <div class="ad-field"><label>${escapeAdmin(t('code'))}</label><input name="code" required></div>
        <div class="ad-grid-2">
          <div class="ad-field"><label>${escapeAdmin(t('type'))}</label><select name="type"><option value="fixed">${escapeAdmin(t('fixed'))}</option><option value="percent">${escapeAdmin(t('percent'))}</option></select></div>
          <div class="ad-field"><label>${escapeAdmin(t('price'))}</label><input name="amount" type="number" min="1" required></div>
        </div>
        <div class="ad-grid-2">
          <div class="ad-field"><label>${escapeAdmin(t('minOrder'))}</label><input name="minOrder" type="number" min="0" value="0"></div>
          <div class="ad-field"><label>${escapeAdmin(t('expires'))}</label><input name="expires" type="date"></div>
        </div>
        <button class="ad-btn" type="submit">${escapeAdmin(t('save'))}</button>
      </form>
    `);
    document.getElementById('coupon-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const coupons = StoreState.getCoupons();
      coupons.unshift({
        id: Date.now(),
        code: String(data.get('code')).trim().toUpperCase(),
        type: data.get('type'),
        amount: Number(data.get('amount')),
        minOrder: Number(data.get('minOrder') || 0),
        expires: data.get('expires'),
        active: true
      });
      StoreState.saveCoupons(coupons);
      closeAdminModal();
      adminToast(t('saved'));
      renderCoupons();
    });
  });
  document.querySelectorAll('[data-toggle-coupon]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const coupons = StoreState.getCoupons();
      const coupon = coupons.find((item) => String(item.id) === btn.dataset.toggleCoupon);
      if (coupon) coupon.active = !coupon.active;
      StoreState.saveCoupons(coupons);
      renderCoupons();
    });
  });
  document.querySelectorAll('[data-del-coupon]').forEach((btn) => {
    btn.addEventListener('click', () => {
      StoreState.saveCoupons(StoreState.getCoupons().filter((item) => String(item.id) !== btn.dataset.delCoupon));
      renderCoupons();
    });
  });
}

function storefrontStringPack(lang) {
  const base = (typeof translations !== 'undefined' && translations[lang]) || {};
  const override = StoreState.getCms().strings?.[lang] || {};
  return { ...base, ...override };
}

function renderCms() {
  const cms = StoreState.getCms();
  const lang = adminLang();
  const strings = storefrontStringPack(lang);
  mountAdmin(`
    <div class="ad-card" style="margin-bottom:1rem">
      <h2>${escapeAdmin(t('announcement'))}</h2>
      <form id="announce-form">
        <label class="ad-field"><span>${escapeAdmin(t('enabled'))}</span><select name="enabled"><option value="1" ${cms.announcement?.enabled !== false ? 'selected' : ''}>${escapeAdmin(t('enabled'))}</option><option value="0" ${cms.announcement?.enabled === false ? 'selected' : ''}>${escapeAdmin(t('hidden'))}</option></select></label>
        <div class="ad-grid-2">
          <div class="ad-field"><label>AR</label><input name="textAr" value="${escapeAdmin(cms.announcement?.textAr || '')}"></div>
          <div class="ad-field"><label>EN</label><input name="textEn" value="${escapeAdmin(cms.announcement?.textEn || '')}"></div>
        </div>
        <button class="ad-btn" type="submit">${escapeAdmin(t('save'))}</button>
      </form>
    </div>
    <div class="ad-card">
      <h2>${escapeAdmin(t('strings'))} (${lang})</h2>
      <input id="string-filter" class="ad-search" placeholder="${escapeAdmin(t('search'))}">
      <form id="strings-form">
        ${Object.keys(strings).map((key) => `
          <div class="ad-field" data-string-row="${escapeAdmin(key)}"><label>${escapeAdmin(key)}</label><input name="${escapeAdmin(key)}" value="${escapeAdmin(strings[key])}"></div>
        `).join('')}
        <button class="ad-btn" type="submit">${escapeAdmin(t('save'))}</button>
      </form>
    </div>
  `);
  document.getElementById('announce-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const next = StoreState.getCms();
    next.announcement = { enabled: data.get('enabled') === '1', textAr: data.get('textAr'), textEn: data.get('textEn') };
    next.strings = next.strings || { ar: {}, en: {} };
    next.strings.ar.banner_text = data.get('textAr');
    next.strings.en.banner_text = data.get('textEn');
    StoreState.saveCms(next);
    adminToast(t('saved'));
  });
  document.getElementById('string-filter')?.addEventListener('input', (event) => {
    const q = String(event.target.value || '').toLowerCase();
    document.querySelectorAll('[data-string-row]').forEach((row) => {
      row.hidden = q && !row.dataset.stringRow.toLowerCase().includes(q) && !row.querySelector('input')?.value.toLowerCase().includes(q);
    });
  });
  document.getElementById('strings-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const next = StoreState.getCms();
    next.strings = next.strings || { ar: {}, en: {} };
    next.strings[lang] = Object.fromEntries(data.entries());
    StoreState.saveCms(next);
    adminToast(t('saved'));
  });
}

function renderContent() {
  const cms = StoreState.getCms();
  mountAdmin(`
    <div class="ad-card" style="margin-bottom:1rem">
      <div class="admin-actions" style="justify-content:space-between">
        <h2 style="margin:0">${escapeAdmin(t('faqs'))}</h2>
        <button class="ad-btn" id="add-faq">${escapeAdmin(t('add'))}</button>
      </div>
      ${(cms.faqs || []).map((item) => `<article style="padding:.8rem 0;border-bottom:1px solid #334155">
        <strong>${escapeAdmin(adminLang() === 'en' ? item.qEn : item.qAr)}</strong>
        <div class="admin-actions" style="margin-top:.4rem">
          <button class="ad-ghost" data-edit-faq="${item.id}">${escapeAdmin(t('edit'))}</button>
          <button class="ad-danger" data-del-faq="${item.id}">${escapeAdmin(t('delete'))}</button>
        </div>
      </article>`).join('') || `<p>${escapeAdmin(t('empty'))}</p>`}
    </div>
    <div class="ad-card" style="margin-bottom:1rem">
      <div class="admin-actions" style="justify-content:space-between">
        <h2 style="margin:0">${escapeAdmin(t('branches'))}</h2>
        <button class="ad-btn" id="add-branch">${escapeAdmin(t('add'))}</button>
      </div>
      ${(cms.branches || []).map((item) => `<article style="padding:.8rem 0;border-bottom:1px solid #334155">
        <strong>${escapeAdmin(adminLang() === 'en' ? item.nameEn : item.nameAr)}</strong>
        <p style="color:#94a3b8">${escapeAdmin(item.phone)}</p>
        <button class="ad-danger" data-del-branch="${item.id}">${escapeAdmin(t('delete'))}</button>
      </article>`).join('') || `<p>${escapeAdmin(t('empty'))}</p>`}
    </div>
    <div class="ad-card">
      <h2>${escapeAdmin(t('policies'))}</h2>
      <form id="policy-form">
        <div class="ad-field"><label>Warranty AR</label><textarea name="warrantyAr">${escapeAdmin(cms.policies?.warrantyAr || '')}</textarea></div>
        <div class="ad-field"><label>Warranty EN</label><textarea name="warrantyEn">${escapeAdmin(cms.policies?.warrantyEn || '')}</textarea></div>
        <div class="ad-field"><label>Return AR</label><textarea name="returnAr">${escapeAdmin(cms.policies?.returnAr || '')}</textarea></div>
        <div class="ad-field"><label>Return EN</label><textarea name="returnEn">${escapeAdmin(cms.policies?.returnEn || '')}</textarea></div>
        <div class="ad-field"><label>Privacy AR</label><textarea name="privacyAr">${escapeAdmin(cms.policies?.privacyAr || '')}</textarea></div>
        <div class="ad-field"><label>Privacy EN</label><textarea name="privacyEn">${escapeAdmin(cms.policies?.privacyEn || '')}</textarea></div>
        <button class="ad-btn" type="submit">${escapeAdmin(t('save'))}</button>
      </form>
    </div>
  `);
  document.getElementById('add-faq')?.addEventListener('click', () => openFaqModal(null));
  document.querySelectorAll('[data-edit-faq]').forEach((btn) => {
    btn.addEventListener('click', () => openFaqModal((StoreState.getCms().faqs || []).find((item) => String(item.id) === btn.dataset.editFaq)));
  });
  document.querySelectorAll('[data-del-faq]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = StoreState.getCms();
      next.faqs = (next.faqs || []).filter((item) => String(item.id) !== btn.dataset.delFaq);
      StoreState.saveCms(next);
      renderContent();
    });
  });
  document.getElementById('add-branch')?.addEventListener('click', () => openBranchModal());
  document.querySelectorAll('[data-del-branch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = StoreState.getCms();
      next.branches = (next.branches || []).filter((item) => String(item.id) !== btn.dataset.delBranch);
      StoreState.saveCms(next);
      renderContent();
    });
  });
  document.getElementById('policy-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const next = StoreState.getCms();
    next.policies = Object.fromEntries(data.entries());
    StoreState.saveCms(next);
    adminToast(t('saved'));
  });
}

function openFaqModal(faq) {
  adminModal(`
    <h2>${escapeAdmin(t('faqs'))}</h2>
    <form id="faq-form">
      <div class="ad-field"><label>Q AR</label><input name="qAr" required value="${escapeAdmin(faq?.qAr || '')}"></div>
      <div class="ad-field"><label>Q EN</label><input name="qEn" required value="${escapeAdmin(faq?.qEn || '')}"></div>
      <div class="ad-field"><label>A AR</label><textarea name="aAr" required>${escapeAdmin(faq?.aAr || '')}</textarea></div>
      <div class="ad-field"><label>A EN</label><textarea name="aEn" required>${escapeAdmin(faq?.aEn || '')}</textarea></div>
      <button class="ad-btn">${escapeAdmin(t('save'))}</button>
    </form>
  `);
  document.getElementById('faq-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const next = StoreState.getCms();
    next.faqs = next.faqs || [];
    if (faq) Object.assign(faq, data);
    else next.faqs.unshift({ id: Date.now(), category: 'orders', ...data });
    StoreState.saveCms(next);
    closeAdminModal();
    renderContent();
  });
}

function openBranchModal() {
  adminModal(`
    <h2>${escapeAdmin(t('branches'))}</h2>
    <form id="branch-form">
      <div class="ad-field"><label>Name AR</label><input name="nameAr" required></div>
      <div class="ad-field"><label>Name EN</label><input name="nameEn" required></div>
      <div class="ad-grid-2">
        <div class="ad-field"><label>City AR</label><input name="cityAr" required></div>
        <div class="ad-field"><label>City EN</label><input name="cityEn" required></div>
      </div>
      <div class="ad-field"><label>${escapeAdmin(t('phone'))}</label><input name="phone" required></div>
      <div class="ad-field"><label>Map URL</label><input name="mapUrl"></div>
      <button class="ad-btn">${escapeAdmin(t('save'))}</button>
    </form>
  `);
  document.getElementById('branch-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const next = StoreState.getCms();
    next.branches = next.branches || [];
    next.branches.unshift({ id: Date.now(), hoursAr: '', hoursEn: '', addressAr: '', addressEn: '', ...data });
    StoreState.saveCms(next);
    closeAdminModal();
    renderContent();
  });
}

function renderSettings() {
  const settings = StoreState.getSettings();
  mountAdmin(`
    <div class="ad-card">
      <form id="settings-form" class="ad-grid-2">
        <div class="ad-field"><label>WhatsApp ${escapeAdmin(t('brand'))}</label><input name="whatsappAdmin" value="${escapeAdmin(settings.whatsappAdmin)}"></div>
        <div class="ad-field"><label>${escapeAdmin(t('low'))}</label><input name="lowStock" type="number" min="1" value="${escapeAdmin(settings.lowStock)}"></div>
        <div class="ad-field"><label>${escapeAdmin(t('nameAr'))}</label><input name="storeNameAr" value="${escapeAdmin(settings.storeNameAr)}"></div>
        <div class="ad-field"><label>${escapeAdmin(t('nameEn'))}</label><input name="storeNameEn" value="${escapeAdmin(settings.storeNameEn)}"></div>
        <p class="ad-note" style="grid-column:1/-1">${escapeAdmin(t('engineNote'))}</p>
        <div class="admin-actions" style="grid-column:1/-1"><button class="ad-btn">${escapeAdmin(t('save'))}</button></div>
      </form>
    </div>
  `);
  document.getElementById('settings-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    StoreState.saveSettings(Object.fromEntries(new FormData(event.target).entries()));
    adminToast(t('saved'));
  });
}

window.renderAdminPage = function renderAdminPage() {
  if (!AdminAuth.guard()) return;
  try {
  StoreState.ensure();
  const page = document.body.dataset.adminPage;
  ({
    overview: renderOverview,
    products: renderProducts,
    inventory: renderInventory,
    orders: renderOrders,
    customers: renderCustomers,
    coupons: renderCoupons,
    cms: renderCms,
    content: renderContent,
    settings: renderSettings
  }[page] || renderOverview)();
  } catch { const host = document.getElementById('admin-app'); if (host) host.textContent = 'Unable to load dashboard. Check site storage permissions. تعذّر تحميل لوحة العرض؛ تحقق من تخزين الموقع.'; }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.adminPage) window.renderAdminPage();
});
