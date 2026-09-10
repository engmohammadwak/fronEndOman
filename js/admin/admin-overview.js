let overviewOrdersPage = 1;

function renderOverview() {
  const kpi = StoreState.kpis();
  const orders = StoreState.getOrders();
  const products = StoreState.getProducts();
  const salesSeries = AdminLayout.salesByDay(orders, 30);
  const categorySeries = AdminLayout.salesByCategory(orders, products);
  const top = AdminLayout.topProducts(orders, products, 5);
  const paged = AdminLayout.paginate(orders, overviewOrdersPage, 5);
  const salesChange = salesSeries.length > 1
    ? Math.round(((salesSeries[salesSeries.length - 1].value - salesSeries[0].value) / Math.max(1, salesSeries[0].value || 1)) * 100)
    : 0;

  mountAdmin(`
    <section class="page-section card">
      ${AdminLayout.pageHeader({
        title: t('welcomeTitle'),
        desc: t('welcomeDesc'),
        actions: `
          <a class="ad-btn" href="${AdminAuth.adminPath('products')}">${escapeAdmin(t('addProduct'))}</a>
          <a class="ad-ghost" href="${AdminAuth.adminPath('orders')}">${escapeAdmin(t('viewReports'))}</a>
        `
      })}
    </section>

    <section class="page-section kpi-grid">
      <article class="kpi">
        <span class="material-symbols-outlined">payments</span>
        <span>${escapeAdmin(t('sales'))}</span>
        <strong>${escapeAdmin(money(kpi.sales))}</strong>
        <small class="kpi-change ${salesChange < 0 ? 'is-down' : ''}">${salesChange >= 0 ? '+' : ''}${salesChange}% ${escapeAdmin(t('changePercent'))}</small>
      </article>
      <article class="kpi">
        <span class="material-symbols-outlined">receipt_long</span>
        <span>${escapeAdmin(t('openOrders'))}</span>
        <strong>${kpi.openOrders} / ${kpi.orders}</strong>
        <small class="kpi-change">${kpi.customers} ${escapeAdmin(t('customers'))}</small>
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
    </section>

    <section class="page-section charts-grid">
      <div class="card">
        <div class="section-head"><h3>${escapeAdmin(t('sales30'))}</h3></div>
        ${AdminLayout.barChart(salesSeries)}
      </div>
      <div class="card">
        <div class="section-head"><h3>${escapeAdmin(t('salesByCategory'))}</h3></div>
        ${AdminLayout.donutChart(categorySeries.length ? categorySeries : [{ label: t('empty'), value: 0 }])}
      </div>
    </section>

    <section class="page-section card">
      <div class="section-head">
        <h3>${escapeAdmin(t('recentOrders'))}</h3>
        <a class="ad-ghost" href="${AdminAuth.adminPath('orders')}">${escapeAdmin(t('viewAllOrders'))}</a>
      </div>
      ${ordersTable(paged.items)}
      ${AdminLayout.paginationControls(paged, 'data-overview-page')}
    </section>

    <section class="page-section card">
      <div class="section-head"><h3>${escapeAdmin(t('topSelling'))}</h3></div>
      ${top.length ? top.map((item) => `
        <div class="top-product">
          <img alt="" src="${escapeAdmin(item.image || '')}">
          <div style="flex:1;min-width:0">
            <strong>${escapeAdmin(adminLang() === 'en' ? (item.nameEn || item.nameAr) : (item.nameAr || item.nameEn))}</strong>
            <span>${escapeAdmin(item.qty)} × · ${escapeAdmin(money(item.sales))}</span>
          </div>
          <strong class="font-mono">${escapeAdmin(money(item.price))}</strong>
        </div>
      `).join('') : `<p class="ad-note">${escapeAdmin(t('empty'))}</p>`}
    </section>
  `);
  bindOrdersTable();
  document.querySelectorAll('[data-overview-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      overviewOrdersPage = Number(btn.getAttribute('data-overview-page')) || 1;
      renderOverview();
    });
  });
}
