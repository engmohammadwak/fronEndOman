let posCart = [];
let posCatalog = [];
let posCategoryList = [];
let posPayment = 'CASH';
let posSearch = '';
let posCategory = '';
let posBusy = false;

function posMoney(value) {
  return money(Number(value || 0));
}

function posProductName(product) {
  return adminLang() === 'en'
    ? (product.nameEn || product.nameAr || '')
    : (product.nameAr || product.nameEn || '');
}

function posCategoryRecords() {
  if (posCategoryList.length) {
    return posCategoryList
      .filter((item) => item.active !== false)
      .sort((a, b) => (a.sortOrder - b.sortOrder) || (a.id - b.id));
  }
  const set = new Set();
  posCatalog.forEach((item) => {
    const cat = String(item.category || '').trim();
    if (cat) set.add(cat);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, adminLang() === 'en' ? 'en' : 'ar'))
    .map((slug) => ({ slug, nameAr: slug, nameEn: slug }));
}

function posCategoryLabel(cat) {
  if (!cat) return '';
  if (typeof cat === 'string') {
    const found = posCategoryList.find((item) => item.slug === cat);
    if (found) return posCategoryLabel(found);
    return cat;
  }
  return adminLang() === 'en'
    ? (cat.nameEn || cat.nameAr || cat.slug)
    : (cat.nameAr || cat.nameEn || cat.slug);
}

function posFilteredCatalog() {
  const q = posSearch.trim().toLowerCase();
  return posCatalog.filter((item) => {
    if (posCategory && String(item.category || '') !== posCategory) return false;
    if (!q) return true;
    const hay = [
      item.nameAr,
      item.nameEn,
      item.sku,
      item.barcode,
      item.brand,
      item.category
    ].map((v) => String(v || '').toLowerCase()).join(' ');
    return hay.includes(q);
  });
}

function posTotals() {
  const subtotal = posCart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const listSubtotal = posCart.reduce((sum, item) => sum + Number(item.listPrice) * Number(item.quantity), 0);
  const tax = posCart.reduce((sum, item) => {
    const line = Number(item.price) * Number(item.quantity);
    return sum + line * (Number(item.taxRate || 5) / 100);
  }, 0);
  const discount = Math.max(0, listSubtotal - subtotal);
  return {
    subtotal: Number(subtotal.toFixed(3)),
    listSubtotal: Number(listSubtotal.toFixed(3)),
    discount: Number(discount.toFixed(3)),
    tax: Number(tax.toFixed(3)),
    total: Number((subtotal + tax).toFixed(3)),
    items: posCart.reduce((sum, item) => sum + Number(item.quantity), 0)
  };
}

function syncPosCatalogStock(items) {
  (items || []).forEach((item) => {
    const stock = Number(item.remainingStock ?? item.stock);
    if (!Number.isFinite(stock)) return;
    const row = posCatalog.find((p) => String(p.id) === String(item.id));
    if (row) row.stock = stock;
    const cart = posCart.find((p) => String(p.id) === String(item.id));
    if (cart) cart.stock = stock;
  });
}

function renderPosCatalog() {
  const grid = document.getElementById('pos-product-grid');
  const countEl = document.getElementById('pos-catalog-count');
  if (!grid) return;
  const list = posFilteredCatalog();
  if (countEl) countEl.textContent = String(list.length);
  if (!posCatalog.length) {
    grid.innerHTML = `<div class="pos-empty">${escapeAdmin(t('posNoProducts'))}</div>`;
    return;
  }
  if (!list.length) {
    grid.innerHTML = `<div class="pos-empty">${escapeAdmin(t('posNoMatch'))}</div>`;
    return;
  }
  grid.innerHTML = list.map((product) => {
    const stock = Number(product.stock || 0);
    const out = stock <= 0;
    const low = !out && stock <= Number(product.minStock || 3);
    const stockClass = out ? 'is-out' : low ? 'is-low' : 'is-ok';
    const img = product.image
      ? `<img src="${escapeAdmin(product.image)}" alt="" loading="lazy">`
      : `<span class="material-symbols-outlined" aria-hidden="true">inventory_2</span>`;
    return `
      <button type="button" class="pos-product-card ${out ? 'is-disabled' : ''}" data-pos-add="${escapeAdmin(product.id)}" ${out ? 'disabled' : ''}>
        <div class="pos-product-thumb">${img}</div>
        <div class="pos-product-body">
          <strong>${escapeAdmin(posProductName(product))}</strong>
          <span class="pos-product-meta">${escapeAdmin(product.sku || product.barcode || '—')}</span>
          <div class="pos-product-foot">
            <span class="pos-product-price">${escapeAdmin(posMoney(product.price))}</span>
            <span class="pos-stock-pill ${stockClass}">${escapeAdmin(t('posStock'))}: ${stock}</span>
          </div>
        </div>
      </button>
    `;
  }).join('');
}

function renderPosCategories() {
  const wrap = document.getElementById('pos-category-chips');
  if (!wrap) return;
  const cats = posCategoryRecords();
  const allActive = !posCategory ? 'is-active' : '';
  wrap.innerHTML = `
    <button type="button" class="pos-chip ${allActive}" data-pos-cat="">${escapeAdmin(t('posAllCategories'))}</button>
    ${cats.map((cat) => `
      <button type="button" class="pos-chip ${posCategory === cat.slug ? 'is-active' : ''}" data-pos-cat="${escapeAdmin(cat.slug)}">${escapeAdmin(posCategoryLabel(cat))}</button>
    `).join('')}
  `;
}

function renderPosCart() {
  const list = document.getElementById('pos-cart-list');
  const totals = posTotals();
  if (!list) return;
  if (!posCart.length) {
    list.innerHTML = `
      <div class="pos-cart-empty">
        <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
        <p>${escapeAdmin(t('posEmptyCart'))}</p>
        <small>${escapeAdmin(t('posEmptyHint'))}</small>
      </div>
    `;
  } else {
    list.innerHTML = posCart.map((item, index) => {
      const line = Number(item.price) * Number(item.quantity);
      const discounted = Number(item.price) < Number(item.listPrice);
      const discountPct = discounted && Number(item.listPrice) > 0
        ? Math.round((1 - Number(item.price) / Number(item.listPrice)) * 100)
        : 0;
      return `
        <article class="pos-cart-row" data-pos-line="${index}">
          <div class="pos-cart-main">
            <strong>${escapeAdmin(posProductName(item))}</strong>
            <div class="pos-cart-meta">${escapeAdmin(item.barcode || item.sku || '—')} · ${escapeAdmin(t('posStock'))}: ${item.stock}</div>
            <div class="pos-price-edit">
              <label>
                <span>${escapeAdmin(t('posUnitPrice'))}</span>
                <input type="number" min="0" step="0.001" inputmode="decimal" data-pos-price="${index}" value="${Number(item.price)}">
              </label>
              <span class="pos-list-price ${discounted ? 'is-cut' : ''}">${escapeAdmin(posMoney(item.listPrice))}</span>
              ${discounted ? `<span class="pos-discount-badge">−${discountPct}%</span>` : ''}
            </div>
          </div>
          <div class="pos-cart-side">
            <div class="pos-qty">
              <button type="button" class="pos-qty-btn" data-pos-qty="${index}" data-delta="-1" aria-label="-">−</button>
              <input type="number" class="pos-qty-input" min="1" step="1" inputmode="numeric" data-pos-qty-input="${index}" value="${item.quantity}">
              <button type="button" class="pos-qty-btn" data-pos-qty="${index}" data-delta="1" aria-label="+">+</button>
            </div>
            <div class="pos-line-total">${escapeAdmin(posMoney(line))}</div>
            <button type="button" class="pos-remove" data-pos-remove="${index}" aria-label="${escapeAdmin(t('posRemove'))}">
              <span class="material-symbols-outlined" aria-hidden="true">delete</span>
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText('pos-subtotal', posMoney(totals.subtotal));
  setText('pos-tax', posMoney(totals.tax));
  setText('pos-total', posMoney(totals.total));
  setText('pos-discount', posMoney(totals.discount));
  setText('pos-item-count', String(totals.items));
  const discountRow = document.getElementById('pos-discount-row');
  if (discountRow) discountRow.hidden = totals.discount <= 0;
  const checkout = document.getElementById('pos-checkout');
  if (checkout) checkout.disabled = !posCart.length || posBusy;
}

function renderPosShell() {
  renderPosCategories();
  renderPosCatalog();
  renderPosCart();
}

function addPosProduct(product, { quantity = 1 } = {}) {
  const stock = Number(product.stock || 0);
  if (stock <= 0) {
    adminToast(t('posOutOfStock'));
    return;
  }
  const qty = Math.max(1, Number(quantity) || 1);
  const existing = posCart.find((item) => String(item.id) === String(product.id));
  if (existing) {
    if (existing.quantity + qty > stock) {
      adminToast(t('posInsufficient'));
      return;
    }
    existing.quantity += qty;
    existing.stock = stock;
  } else {
    const listPrice = Number(product.price || 0);
    posCart.push({
      id: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      sku: product.sku,
      barcode: product.barcode,
      listPrice,
      price: listPrice,
      taxRate: Number(product.taxRate || 5),
      stock,
      quantity: Math.min(qty, stock)
    });
  }
  renderPosCart();
  renderPosCatalog();
}

async function loadPosCatalog() {
  const grid = document.getElementById('pos-product-grid');
  if (grid) grid.innerHTML = `<div class="pos-empty">${escapeAdmin(t('posLoading'))}</div>`;
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch('/api/products', { credentials: 'same-origin', headers: { Accept: 'application/json' } }),
      fetch('/api/categories', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
    ]);
    const productsData = await productsRes.json().catch(() => ({}));
    const categoriesData = await categoriesRes.json().catch(() => ({}));
    if (categoriesRes.ok && categoriesData.ok && Array.isArray(categoriesData.categories)) {
      posCategoryList = categoriesData.categories;
    }
    if (productsRes.ok && productsData.ok && Array.isArray(productsData.products) && (productsData.source === 'mysql' || productsData.products.length)) {
      posCatalog = productsData.products.filter((p) => p.active !== false);
    } else if (typeof StoreState?.getProducts === 'function') {
      posCatalog = StoreState.getProducts().filter((p) => p.active !== false);
    } else {
      posCatalog = [];
    }
  } catch {
    posCatalog = typeof StoreState?.getProducts === 'function'
      ? StoreState.getProducts().filter((p) => p.active !== false)
      : [];
  }
  renderPosShell();
}

async function scanPosCode(code) {
  const value = String(code || '').trim();
  if (!value) return;
  const local = posCatalog.find((p) => {
    const sku = String(p.sku || '').toLowerCase();
    const barcode = String(p.barcode || '').toLowerCase();
    const needle = value.toLowerCase();
    return sku === needle || barcode === needle;
  });
  if (local) {
    addPosProduct(local);
    return;
  }
  const response = await fetch(`/api/pos/scan/${encodeURIComponent(value)}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    adminToast(data.message || data.error || t('posNotFound'));
    return;
  }
  const idx = posCatalog.findIndex((p) => String(p.id) === String(data.product.id));
  if (idx >= 0) posCatalog[idx] = { ...posCatalog[idx], ...data.product };
  else posCatalog.unshift(data.product);
  addPosProduct(data.product);
  renderPosCatalog();
}

async function checkoutPos() {
  if (!posCart.length || posBusy) {
    if (!posCart.length) adminToast(t('posEmptyCart'));
    return;
  }
  posBusy = true;
  renderPosCart();
  try {
    const response = await fetch('/api/pos/checkout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        paymentMethod: posPayment,
        items: posCart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: Number(item.price)
        }))
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      adminToast(data.error || t('posCheckoutFailed'));
      return;
    }
    adminToast(`${t('posSaleOk')} ${data.invoiceNumber}`);
    syncPosCatalogStock(data.items || []);
    posCart = [];
    renderPosShell();
    if (typeof StoreState.applyStockMutation === 'function') {
      StoreState.applyStockMutation(data.items || []);
    }
    document.getElementById('pos-barcode')?.focus();
  } finally {
    posBusy = false;
    renderPosCart();
  }
}

function renderPos() {
  mountAdmin(`
    ${AdminLayout.pageHeader({
      title: t('pos'),
      desc: t('posDesc'),
      actions: `
        <span id="pos-ws-status" class="status-badge is-online">● ${escapeAdmin(t('posLiveSync'))}</span>
        <a class="ad-ghost" href="${AdminAuth.adminPath('inventory')}">${escapeAdmin(t('inventory'))}</a>
      `
    })}
    <div class="pos-toolbar ad-card">
      <div class="pos-toolbar-scan">
        <label for="pos-barcode">${escapeAdmin(t('posScanLabel'))}</label>
        <div class="pos-scan-row">
          <span class="material-symbols-outlined" aria-hidden="true">qr_code_scanner</span>
          <input id="pos-barcode" class="pos-barcode-input" autocomplete="off" placeholder="${escapeAdmin(t('posScanPlaceholder'))}">
          <button type="button" class="ad-btn" id="pos-scan-btn">${escapeAdmin(t('posAdd'))}</button>
        </div>
        <p class="ad-note">${escapeAdmin(t('posScanHint'))}</p>
      </div>
      <div class="pos-toolbar-search">
        <label for="pos-search">${escapeAdmin(t('posSearchLabel'))}</label>
        <div class="pos-search-row">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <input id="pos-search" autocomplete="off" placeholder="${escapeAdmin(t('posSearchPlaceholder'))}">
        </div>
      </div>
      <div class="pos-toolbar-actions">
        <button type="button" class="ad-ghost" id="pos-clear-cart">${escapeAdmin(t('posClearCart'))}</button>
        <button type="button" class="ad-ghost" id="pos-receive-btn">${escapeAdmin(t('posReceive'))}</button>
      </div>
    </div>
    <div class="pos-layout">
      <section class="pos-catalog-panel">
        <div class="pos-catalog-head">
          <h3>${escapeAdmin(t('posCatalog'))} <span id="pos-catalog-count" class="pos-count">0</span></h3>
          <div id="pos-category-chips" class="pos-chips"></div>
        </div>
        <div id="pos-product-grid" class="pos-product-grid"></div>
      </section>
      <aside class="ad-card pos-cart-panel">
        <div class="pos-cart-head">
          <h3>${escapeAdmin(t('posCart'))}</h3>
          <span class="pos-count-pill"><span id="pos-item-count">0</span> ${escapeAdmin(t('posItems'))}</span>
        </div>
        <div id="pos-cart-list" class="pos-cart-list"></div>
        <div class="pos-totals">
          <div><span>${escapeAdmin(t('posSubtotal'))}</span><strong id="pos-subtotal">0</strong></div>
          <div id="pos-discount-row" hidden><span>${escapeAdmin(t('posDiscount'))}</span><strong id="pos-discount" class="pos-discount-value">0</strong></div>
          <div><span>${escapeAdmin(t('posTax'))}</span><strong id="pos-tax">0</strong></div>
          <div class="pos-total-row"><span>${escapeAdmin(t('total'))}</span><strong id="pos-total">0</strong></div>
          <div class="ad-field pos-payment-field">
            <label for="pos-payment">${escapeAdmin(t('posPayment'))}</label>
            <select id="pos-payment">
              <option value="CASH">${escapeAdmin(t('posCash'))}</option>
              <option value="CARD">${escapeAdmin(t('posCard'))}</option>
            </select>
          </div>
          <button type="button" class="ad-btn pos-checkout-btn" id="pos-checkout">${escapeAdmin(t('posCheckout'))}</button>
        </div>
      </aside>
    </div>
  `);

  loadPosCatalog().catch(() => {
    posCatalog = [];
    renderPosShell();
  });

  const barcode = document.getElementById('pos-barcode');
  barcode?.focus();
  barcode?.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const code = barcode.value;
    barcode.value = '';
    try { await scanPosCode(code); } catch { adminToast(t('posCheckoutFailed')); }
  });

  document.getElementById('pos-scan-btn')?.addEventListener('click', async () => {
    const code = barcode?.value || '';
    if (barcode) barcode.value = '';
    try { await scanPosCode(code); } catch { adminToast(t('posCheckoutFailed')); }
    barcode?.focus();
  });

  document.getElementById('pos-search')?.addEventListener('input', (event) => {
    posSearch = event.target.value || '';
    renderPosCatalog();
  });

  document.getElementById('pos-category-chips')?.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-pos-cat]');
    if (!chip) return;
    posCategory = chip.dataset.posCat || '';
    renderPosCategories();
    renderPosCatalog();
  });

  document.getElementById('pos-product-grid')?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-pos-add]');
    if (!card) return;
    const product = posCatalog.find((p) => String(p.id) === String(card.dataset.posAdd));
    if (product) addPosProduct(product);
  });

  document.getElementById('pos-payment')?.addEventListener('change', (event) => {
    posPayment = event.target.value === 'CARD' ? 'CARD' : 'CASH';
  });

  document.getElementById('pos-checkout')?.addEventListener('click', () => {
    checkoutPos().catch(() => adminToast(t('posCheckoutFailed')));
  });

  document.getElementById('pos-clear-cart')?.addEventListener('click', () => {
    if (!posCart.length) return;
    posCart = [];
    renderPosCart();
    barcode?.focus();
  });

  document.getElementById('pos-cart-list')?.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-pos-remove]');
    if (remove) {
      posCart.splice(Number(remove.dataset.posRemove), 1);
      renderPosCart();
      renderPosCatalog();
      return;
    }
    const qtyBtn = event.target.closest('[data-pos-qty]');
    if (!qtyBtn) return;
    const index = Number(qtyBtn.dataset.posQty);
    const delta = Number(qtyBtn.dataset.delta);
    const item = posCart[index];
    if (!item) return;
    const next = item.quantity + delta;
    if (next <= 0) posCart.splice(index, 1);
    else if (next > item.stock) adminToast(t('posInsufficient'));
    else item.quantity = next;
    renderPosCart();
  });

  document.getElementById('pos-cart-list')?.addEventListener('change', (event) => {
    const priceInput = event.target.closest('[data-pos-price]');
    if (priceInput) {
      const index = Number(priceInput.dataset.posPrice);
      const item = posCart[index];
      if (!item) return;
      const next = Number(priceInput.value);
      if (!Number.isFinite(next) || next < 0) {
        adminToast(t('posInvalidPrice'));
        priceInput.value = String(item.price);
        return;
      }
      item.price = Number(next.toFixed(3));
      renderPosCart();
      return;
    }
    const qtyInput = event.target.closest('[data-pos-qty-input]');
    if (!qtyInput) return;
    const index = Number(qtyInput.dataset.posQtyInput);
    const item = posCart[index];
    if (!item) return;
    let next = Math.floor(Number(qtyInput.value));
    if (!Number.isInteger(next) || next <= 0) {
      posCart.splice(index, 1);
      renderPosCart();
      renderPosCatalog();
      return;
    }
    if (next > item.stock) {
      adminToast(t('posInsufficient'));
      next = item.stock;
    }
    item.quantity = next;
    renderPosCart();
  });

  document.getElementById('pos-receive-btn')?.addEventListener('click', async () => {
    const code = prompt(t('posReceiveCode'));
    if (!code) return;
    const qty = Number(prompt(t('posReceiveQty'), '1'));
    if (!Number.isInteger(qty) || qty <= 0) return;
    const response = await fetch('/api/inventory/receive', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ barcode: code.trim(), qty })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      adminToast(data.error || t('posCheckoutFailed'));
      return;
    }
    adminToast(t('saved'));
    syncPosCatalogStock([{ id: data.product.id, remainingStock: data.remainingStock }]);
    renderPosShell();
    if (typeof StoreState.applyStockMutation === 'function') {
      StoreState.applyStockMutation([{ id: data.product.id, remainingStock: data.remainingStock, stock: data.remainingStock }]);
    }
  });

  if (typeof StoreState.connectStockSocket === 'function') {
    StoreState.connectStockSocket((payload) => {
      const status = document.getElementById('pos-ws-status');
      if (status) status.textContent = `● ${t('posLiveSync')}`;
      syncPosCatalogStock(payload.items || []);
      renderPosShell();
    });
  }
}

window.renderPos = renderPos;
