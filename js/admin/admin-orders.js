let ordersViewId = null;
let customersQuery = '';

function ordersTable(orders, { showView = false } = {}) {
  if (!orders.length) return `<p>${escapeAdmin(t('empty'))}</p>`;
  return `<div class="ad-table-wrap"><table class="ad-table">
    <thead><tr>
      <th>${escapeAdmin(t('orders'))}</th>
      <th>${escapeAdmin(t('customer'))}</th>
      <th>${escapeAdmin(adminLang() === 'en' ? 'Date' : 'التاريخ')}</th>
      <th>${escapeAdmin(t('status'))}</th>
      <th>${escapeAdmin(t('total'))}</th>
      <th>${escapeAdmin(t('actions'))}</th>
    </tr></thead>
    <tbody>${orders.map((order) => `
      <tr>
        <td class="font-mono">#${escapeAdmin(order.orderId)}</td>
        <td>${escapeAdmin(order.customerName || '')}<div style="color:#94a3b8">${escapeAdmin(order.phone || '')}</div></td>
        <td>${escapeAdmin(String(order.createdAt || '').slice(0, 16).replace('T', ' '))}</td>
        <td><span class="ad-chip">${escapeAdmin(statusLabel(order.status))}</span></td>
        <td>${escapeAdmin(money(order.total))}</td>
        <td>
          ${showView ? `<button class="ad-ghost" data-view-order="${escapeAdmin(order.orderId)}">${escapeAdmin(t('view'))}</button>` : ''}
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

function orderTimeline(order) {
  const steps = ['received', 'processing', 'shipped', 'delivered'];
  const current = steps.includes(order.status) ? order.status : 'processing';
  const currentIndex = steps.indexOf(current);
  return `<div class="timeline">${steps.map((step, index) => `
    <div class="timeline-step ${index < currentIndex ? 'is-done' : ''} ${index === currentIndex ? 'is-current' : ''}">
      <span class="material-symbols-outlined">${index <= currentIndex ? 'check_circle' : 'radio_button_unchecked'}</span>
      <div>
        <strong>${escapeAdmin(t(step))}</strong>
        <div style="color:#64748b;font-size:.75rem">${index === 0 ? escapeAdmin(String(order.createdAt || '').replace('T', ' ').slice(0, 16)) : (index === currentIndex ? escapeAdmin(String(order.updatedAt || order.createdAt || '').replace('T', ' ').slice(0, 16)) : '—')}</div>
      </div>
    </div>
  `).join('')}</div>`;
}

function renderOrderDetails(order) {
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
  const discount = Number(order.promo || order.discount || 0);
  const shipping = Number(order.shipping || 0);
  mountAdmin(`
    ${AdminLayout.pageHeader({
      title: `#${order.orderId}`,
      desc: `${statusLabel(order.status)} · ${String(order.createdAt || '').replace('T', ' ').slice(0, 16)}`,
      actions: `<button class="ad-ghost" id="back-orders">${escapeAdmin(t('backToOrders'))}</button>`
    })}
    <div class="order-detail-grid page-section">
      <div class="card">
        <h3 class="card-title">${escapeAdmin(t('customerInfo'))}</h3>
        <p><strong>${escapeAdmin(order.customerName || '')}</strong></p>
        <p>${escapeAdmin(order.phone || '')}</p>
        <p>${escapeAdmin(order.email || '—')}</p>
        <p>${escapeAdmin(order.address || '')}</p>
      </div>
      <div class="card">
        <h3 class="card-title">${escapeAdmin(t('orderItems'))}</h3>
        <div class="ad-table-wrap"><table class="ad-table">
          <thead><tr><th></th><th>${escapeAdmin(t('nameAr'))}</th><th>${escapeAdmin(t('qty'))}</th><th>${escapeAdmin(t('price'))}</th><th>${escapeAdmin(t('total'))}</th></tr></thead>
          <tbody>${items.map((item) => `
            <tr>
              <td><img alt="" src="${escapeAdmin(item.image || '')}"></td>
              <td>${escapeAdmin(adminLang() === 'en' ? (item.nameEn || item.nameAr) : (item.nameAr || item.nameEn))}</td>
              <td>${escapeAdmin(item.qty || 1)}</td>
              <td>${escapeAdmin(money(item.price))}</td>
              <td>${escapeAdmin(money(Number(item.price || 0) * Number(item.qty || 1)))}</td>
            </tr>
          `).join('')}</tbody>
        </table></div>
      </div>
      <div class="card">
        <h3 class="card-title">${escapeAdmin(t('paymentSummary'))}</h3>
        <p>${escapeAdmin(t('subtotal'))}: <strong>${escapeAdmin(money(subtotal))}</strong></p>
        <p>${escapeAdmin(t('shipping'))}: <strong>${escapeAdmin(money(shipping))}</strong></p>
        <p>${escapeAdmin(t('discount'))}: <strong>${escapeAdmin(money(discount))}</strong></p>
        <p>${escapeAdmin(t('total'))}: <strong>${escapeAdmin(money(order.total))}</strong></p>
        <p>${escapeAdmin(t('payment'))}: <strong>${escapeAdmin(order.payment || order.paymentStatus || '—')}</strong></p>
      </div>
    </div>
    <div class="card page-section">
      <div class="section-head"><h3>${escapeAdmin(t('status'))}</h3></div>
      ${orderTimeline(order)}
    </div>
    <div class="card admin-actions page-section">
      <select id="detail-order-status">
        ${['received', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => `
          <option value="${status}" ${order.status === status ? 'selected' : ''}>${escapeAdmin(t(status))}</option>
        `).join('')}
      </select>
      <button class="ad-btn" id="detail-update-status">${escapeAdmin(t('updateStatus'))}</button>
      ${order.phone ? `<a class="ad-wa" target="_blank" rel="noopener noreferrer" href="${escapeAdmin(customerWhatsApp(order))}">${escapeAdmin(t('sendNotice'))}</a>` : ''}
      <button class="ad-ghost" id="detail-invoice">${escapeAdmin(t('printInvoice'))}</button>
      <button class="ad-ghost" id="detail-pdf">${escapeAdmin(t('exportPdf'))}</button>
    </div>
  `);
  document.getElementById('back-orders')?.addEventListener('click', () => {
    ordersViewId = null;
    history.replaceState({}, '', AdminAuth.adminPath('orders'));
    renderOrders();
  });
  document.getElementById('detail-update-status')?.addEventListener('click', () => {
    const status = document.getElementById('detail-order-status')?.value;
    StoreState.updateOrderStatus(order.orderId, status);
    adminToast(t('saved'));
    renderOrders();
  });
  document.getElementById('detail-invoice')?.addEventListener('click', () => printInvoice(order));
  document.getElementById('detail-pdf')?.addEventListener('click', () => printInvoice(order));
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
  document.querySelectorAll('[data-view-order]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ordersViewId = btn.dataset.viewOrder;
      history.replaceState({}, '', `${AdminAuth.adminPath('orders')}?order=${encodeURIComponent(ordersViewId)}`);
      renderOrders();
    });
  });
}

function renderOrders() {
  const params = new URLSearchParams(window.location.search);
  const focus = ordersViewId || params.get('order');
  const local = StoreState.getOrders();
  const paint = (orders) => {
    const selected = focus ? orders.find((item) => item.orderId === focus) : null;
    if (selected) {
      ordersViewId = selected.orderId;
      renderOrderDetails(selected);
      return;
    }
    ordersViewId = null;
    mountAdmin(`
      ${AdminLayout.pageHeader({ title: t('orders'), desc: pageDescription('orders') })}
      <div class="ad-card">${ordersTable(orders, { showView: true })}</div>
    `);
    bindOrdersTable();
  };
  paint(local);
  if (typeof requestBackend !== 'function') return;
  requestBackend('admin/orders').then((data) => {
    const remote = Array.isArray(data.orders) ? data.orders : [];
    if (!remote.length) return;
    const merged = [...remote];
    local.forEach((order) => {
      if (!merged.some((item) => item.orderId === order.orderId)) merged.push(order);
    });
    paint(merged);
  }).catch(() => {});
}

function renderCustomers() {
  const all = StoreState.getCustomers();
  const list = all.filter((item) => {
    const hay = `${item.name} ${item.phone} ${item.email}`.toLowerCase();
    return !customersQuery || hay.includes(customersQuery);
  });
  mountAdmin(`
    ${AdminLayout.pageHeader({ title: t('manageCustomers'), desc: t('customersDesc') })}
    <div class="toolbar card">
      <input id="customer-search" class="ad-search" placeholder="${escapeAdmin(t('search'))}" value="${escapeAdmin(customersQuery)}">
      <button class="ad-btn" id="customer-filter" type="button">${escapeAdmin(t('filter'))}</button>
    </div>
    <div class="ad-card">${list.length ? `<div class="ad-table-wrap"><table class="ad-table">
      <thead><tr>
        <th>${escapeAdmin(t('customer'))}</th>
        <th>${escapeAdmin(t('phone'))}</th>
        <th>${escapeAdmin(t('email'))}</th>
        <th>${escapeAdmin(t('orders'))}</th>
        <th>${escapeAdmin(t('total'))}</th>
        <th>${escapeAdmin(t('lastOrder'))}</th>
        <th>${escapeAdmin(t('actions'))}</th>
      </tr></thead>
      <tbody>${list.map((item) => `<tr>
        <td>${escapeAdmin(item.name || '')}</td>
        <td>${escapeAdmin(item.phone || '')}</td>
        <td>${escapeAdmin(item.email || '—')}</td>
        <td>${item.orders}</td>
        <td>${escapeAdmin(money(item.total))}</td>
        <td class="font-mono">${escapeAdmin(item.lastOrderId || '—')}</td>
        <td>${item.lastOrderId ? `<a class="ad-ghost" href="${AdminAuth.adminPath('orders')}?order=${encodeURIComponent(item.lastOrderId)}">${escapeAdmin(t('view'))}</a>` : ''}</td>
      </tr>`).join('')}</tbody>
    </table></div>` : `<p>${escapeAdmin(t('empty'))}</p>`}</div>
  `);
  document.getElementById('customer-filter')?.addEventListener('click', () => {
    customersQuery = (document.getElementById('customer-search')?.value || '').trim().toLowerCase();
    renderCustomers();
  });
}
