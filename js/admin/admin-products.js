let productsPage = 1;
let productsFilters = { q: '', category: '', status: '' };

function productForm(product) {
  const item = product || {
    id: '', nameAr: '', nameEn: '', brand: 'Apple', price: 0, oldPrice: '', stock: 5,
    listingType: 'new', sku: '', image: '', extraAr: '', extraEn: '', category: 'phones', active: true,
    specs: [], seoTitle: '', seoDesc: '', seoKeywords: ''
  };
  const specs = Array.isArray(item.specs) ? item.specs : [];
  return `
    <h2 style="margin-top:0">${escapeAdmin(product ? t('edit') : t('addProduct'))}</h2>
    <div class="ad-tabs" id="product-tabs">
      <button type="button" class="ad-tab is-active" data-tab="basic">${escapeAdmin(t('basicInfo'))}</button>
      <button type="button" class="ad-tab" data-tab="images">${escapeAdmin(t('imagesTab'))}</button>
      <button type="button" class="ad-tab" data-tab="specs">${escapeAdmin(t('specsTab'))}</button>
      <button type="button" class="ad-tab" data-tab="seo">${escapeAdmin(t('seoTab'))}</button>
    </div>
    <form id="product-form">
      <input type="hidden" name="id" value="${escapeAdmin(item.id)}">
      <div class="ad-tab-panel" data-panel="basic">
        <div class="ad-grid-2">
          <div class="ad-field"><label>${escapeAdmin(t('nameAr'))}</label><input name="nameAr" required value="${escapeAdmin(item.nameAr)}"></div>
          <div class="ad-field"><label>${escapeAdmin(t('nameEn'))}</label><input name="nameEn" required value="${escapeAdmin(item.nameEn)}"></div>
          <div class="ad-field" style="grid-column:1/-1"><label>${escapeAdmin(t('description'))}</label><textarea name="extraAr">${escapeAdmin(item.extraAr || '')}</textarea></div>
          <div class="ad-field"><label>${escapeAdmin(t('category'))}</label>
            <select name="category">
              ${['phones', 'laptops', 'tablets', 'accessories', 'other'].map((cat) => `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
          </div>
          <div class="ad-field"><label>${escapeAdmin(t('brandName'))}</label><input name="brand" value="${escapeAdmin(item.brand || '')}"></div>
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
          <div class="ad-field"><label>SKU</label><input name="sku" value="${escapeAdmin(item.sku || '')}"></div>
          <div class="ad-field"><label>${escapeAdmin(adminLang() === 'en' ? 'English extra' : 'وصف إضافي إنجليزي')}</label><input name="extraEn" value="${escapeAdmin(item.extraEn || '')}"></div>
        </div>
      </div>
      <div class="ad-tab-panel" data-panel="images" hidden>
        <div class="image-drop" id="image-drop">
          <p>${escapeAdmin(t('imageHint'))}</p>
          <div class="ad-field" style="margin-top:0.75rem"><label>${escapeAdmin(t('image'))}</label><input name="image" id="product-image-input" value="${escapeAdmin(item.image || '')}"></div>
          <div class="image-preview" id="image-preview">${item.image ? `<img alt="" src="${escapeAdmin(item.image)}">` : ''}</div>
        </div>
      </div>
      <div class="ad-tab-panel" data-panel="specs" hidden>
        <div id="specs-list">
          ${specs.length ? specs.map((spec, index) => `
            <div class="spec-row" data-spec-row>
              <input name="specName[]" placeholder="${escapeAdmin(t('specName'))}" value="${escapeAdmin(spec.name || '')}">
              <input name="specValue[]" placeholder="${escapeAdmin(t('specValue'))}" value="${escapeAdmin(spec.value || '')}">
              <button type="button" class="ad-danger" data-remove-spec>${escapeAdmin(t('delete'))}</button>
            </div>
          `).join('') : `
            <div class="spec-row" data-spec-row>
              <input name="specName[]" placeholder="${escapeAdmin(t('specName'))}">
              <input name="specValue[]" placeholder="${escapeAdmin(t('specValue'))}">
              <button type="button" class="ad-danger" data-remove-spec>${escapeAdmin(t('delete'))}</button>
            </div>
          `}
        </div>
        <button type="button" class="ad-ghost" id="add-spec">${escapeAdmin(t('addSpec'))}</button>
      </div>
      <div class="ad-tab-panel" data-panel="seo" hidden>
        <div class="ad-field"><label>${escapeAdmin(t('seoTitle'))}</label><input name="seoTitle" value="${escapeAdmin(item.seoTitle || '')}"></div>
        <div class="ad-field"><label>${escapeAdmin(t('seoDesc'))}</label><textarea name="seoDesc">${escapeAdmin(item.seoDesc || '')}</textarea></div>
        <div class="ad-field"><label>${escapeAdmin(t('seoKeywords'))}</label><input name="seoKeywords" value="${escapeAdmin(item.seoKeywords || '')}"></div>
      </div>
      <div class="admin-actions" style="margin-top:1rem">
        <button class="ad-btn" type="submit">${escapeAdmin(t('saveProduct'))}</button>
        <button class="ad-ghost" type="button" data-close-modal>${escapeAdmin(t('cancel'))}</button>
      </div>
    </form>
  `;
}

function bindProductForm(existing) {
  document.querySelector('[data-close-modal]')?.addEventListener('click', closeAdminModal);
  document.querySelectorAll('#product-tabs .ad-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#product-tabs .ad-tab').forEach((node) => node.classList.toggle('is-active', node === tab));
      document.querySelectorAll('#product-form .ad-tab-panel').forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
      });
    });
  });
  document.getElementById('add-spec')?.addEventListener('click', () => {
    const host = document.getElementById('specs-list');
    if (!host) return;
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.dataset.specRow = '1';
    row.innerHTML = `
      <input name="specName[]" placeholder="${escapeAdmin(t('specName'))}">
      <input name="specValue[]" placeholder="${escapeAdmin(t('specValue'))}">
      <button type="button" class="ad-danger" data-remove-spec>${escapeAdmin(t('delete'))}</button>
    `;
    host.appendChild(row);
  });
  document.getElementById('specs-list')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-remove-spec]');
    if (!btn) return;
    btn.closest('[data-spec-row]')?.remove();
  });
  const imageInput = document.getElementById('product-image-input');
  const preview = document.getElementById('image-preview');
  const drop = document.getElementById('image-drop');
  imageInput?.addEventListener('input', () => {
    if (preview) preview.innerHTML = imageInput.value ? `<img alt="" src="${escapeAdmin(imageInput.value)}">` : '';
  });
  drop?.addEventListener('dragover', (event) => event.preventDefault());
  drop?.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/') || !imageInput) return;
    const reader = new FileReader();
    reader.onload = () => {
      imageInput.value = String(reader.result || '');
      if (preview) preview.innerHTML = `<img alt="" src="${escapeAdmin(imageInput.value)}">`;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('product-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const names = data.getAll('specName[]');
    const values = data.getAll('specValue[]');
    const specs = names.map((name, index) => ({ name: String(name || ''), value: String(values[index] || '') })).filter((row) => row.name || row.value);
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
      category: data.get('category') || 'phones',
      active: data.get('active') === '1',
      specs,
      seoTitle: data.get('seoTitle') || '',
      seoDesc: data.get('seoDesc') || '',
      seoKeywords: data.get('seoKeywords') || '',
      isDemo: true
    });
    closeAdminModal();
    adminToast(t('saved'));
    window.renderAdminPage();
  });
}

function productsTable(list, { selectable = true } = {}) {
  if (!list.length) return `<p>${escapeAdmin(t('empty'))}</p>`;
  const low = Number(StoreState.getSettings().lowStock || 3);
  return `<div class="ad-table-wrap"><table class="ad-table">
    <thead><tr>
      ${selectable ? '<th><input type="checkbox" id="select-all-products"></th>' : '<th></th>'}
      <th></th>
      <th>${escapeAdmin(t('nameAr'))}</th>
      <th>${escapeAdmin(t('category'))}</th>
      <th>${escapeAdmin(t('price'))}</th>
      <th>${escapeAdmin(t('stock'))}</th>
      <th>${escapeAdmin(t('status'))}</th>
      <th>${escapeAdmin(t('actions'))}</th>
    </tr></thead>
    <tbody>${list.map((item) => `
      <tr>
        ${selectable ? `<td><input type="checkbox" class="product-check" value="${escapeAdmin(item.id)}"></td>` : '<td></td>'}
        <td><img alt="" src="${escapeAdmin(item.image || '')}"></td>
        <td><strong>${escapeAdmin(adminLang() === 'en' ? item.nameEn : item.nameAr)}</strong><div style="color:#94a3b8;font-size:.7rem">${escapeAdmin(item.sku || '')}</div></td>
        <td>${escapeAdmin(item.category || '')}</td>
        <td class="font-mono">${escapeAdmin(money(item.price))}</td>
        <td><span class="ad-chip ${Number(item.stock) <= 0 ? 'red' : (Number(item.stock) <= low ? 'amber' : 'green')}">${escapeAdmin(item.stock)}</span></td>
        <td><span class="ad-chip ${item.active === false ? 'amber' : 'green'}">${escapeAdmin(item.active === false ? t('hidden') : t('active'))}</span></td>
        <td>
          <button class="ad-ghost" data-edit-product="${escapeAdmin(item.id)}">${escapeAdmin(t('edit'))}</button>
          <button class="ad-danger" data-del-product="${escapeAdmin(item.id)}">${escapeAdmin(t('delete'))}</button>
        </td>
      </tr>
    `).join('')}</tbody>
  </table></div>`;
}

function filteredProducts() {
  return StoreState.getProducts().filter((item) => {
    const hay = `${item.nameAr} ${item.nameEn} ${item.brand} ${item.sku} ${item.category}`.toLowerCase();
    if (productsFilters.q && !hay.includes(productsFilters.q)) return false;
    if (productsFilters.category && item.category !== productsFilters.category) return false;
    if (productsFilters.status === 'active' && item.active === false) return false;
    if (productsFilters.status === 'hidden' && item.active !== false) return false;
    if (productsFilters.status === 'new' && item.listingType === 'refurbished') return false;
    if (productsFilters.status === 'refurbished' && item.listingType !== 'refurbished') return false;
    return true;
  });
}

function bindProductActions() {
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
  document.getElementById('select-all-products')?.addEventListener('change', (event) => {
    document.querySelectorAll('.product-check').forEach((box) => { box.checked = event.target.checked; });
  });
  document.getElementById('bulk-delete-products')?.addEventListener('click', () => {
    const ids = [...document.querySelectorAll('.product-check:checked')].map((box) => box.value);
    ids.forEach((id) => StoreState.deleteProduct(id));
    if (ids.length) {
      adminToast(t('deleted'));
      renderProducts();
    }
  });
}

function renderProducts() {
  const categories = [...new Set(StoreState.getProducts().map((item) => item.category).filter(Boolean))];
  const list = filteredProducts();
  const paged = AdminLayout.paginate(list, productsPage, 8);
  mountAdmin(`
    ${AdminLayout.pageHeader({
      title: t('manageProducts'),
      desc: t('productsDesc'),
      actions: `<button class="ad-btn" id="add-product">${escapeAdmin(t('addProduct'))}</button>`
    })}
    <div class="toolbar card">
      <input id="admin-search" class="ad-search" placeholder="${escapeAdmin(t('search'))}" value="${escapeAdmin(productsFilters.q)}">
      <select id="filter-category">
        <option value="">${escapeAdmin(t('allCategories'))}</option>
        ${categories.map((cat) => `<option value="${escapeAdmin(cat)}" ${productsFilters.category === cat ? 'selected' : ''}>${escapeAdmin(cat)}</option>`).join('')}
      </select>
      <select id="filter-status">
        <option value="">${escapeAdmin(t('allStatuses'))}</option>
        <option value="active" ${productsFilters.status === 'active' ? 'selected' : ''}>${escapeAdmin(t('active'))}</option>
        <option value="hidden" ${productsFilters.status === 'hidden' ? 'selected' : ''}>${escapeAdmin(t('hidden'))}</option>
        <option value="new" ${productsFilters.status === 'new' ? 'selected' : ''}>${escapeAdmin(t('new'))}</option>
        <option value="refurbished" ${productsFilters.status === 'refurbished' ? 'selected' : ''}>${escapeAdmin(t('refurbished'))}</option>
      </select>
      <button class="ad-btn" id="apply-product-filters" type="button">${escapeAdmin(t('filter'))}</button>
      <button class="ad-danger" id="bulk-delete-products" type="button">${escapeAdmin(t('bulkDelete'))}</button>
    </div>
    <div class="ad-card">${productsTable(paged.items)}
      ${AdminLayout.paginationControls(paged, 'data-products-page')}
    </div>
  `);
  document.getElementById('apply-product-filters')?.addEventListener('click', () => {
    productsFilters = {
      q: (document.getElementById('admin-search')?.value || '').trim().toLowerCase(),
      category: document.getElementById('filter-category')?.value || '',
      status: document.getElementById('filter-status')?.value || ''
    };
    productsPage = 1;
    renderProducts();
  });
  document.querySelectorAll('[data-products-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      productsPage = Number(btn.getAttribute('data-products-page')) || 1;
      renderProducts();
    });
  });
  bindProductActions();
}

function renderInventory() {
  const settings = StoreState.getSettings();
  const products = StoreState.getProducts();
  mountAdmin(`
    ${AdminLayout.pageHeader({ title: t('inventory'), desc: pageDescription('inventory') })}
    <div class="kpi-grid page-section">
      <article class="kpi warn"><span>${escapeAdmin(t('low'))}</span><strong>${products.filter((item) => item.stock > 0 && item.stock <= settings.lowStock).length}</strong></article>
      <article class="kpi danger"><span>${escapeAdmin(t('out'))}</span><strong>${products.filter((item) => item.stock <= 0).length}</strong></article>
    </div>
    <div class="ad-card">${productsTable(products, { selectable: false })}</div>
  `);
  bindProductActions();
}
