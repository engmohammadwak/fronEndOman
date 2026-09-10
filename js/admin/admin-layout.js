const AdminLayout = (() => {
  const NOTIFY_KEY = 'techpro_admin_notify_read';

  function pageHeader({ title, desc, actions = '' }) {
    return `
      <div class="page-header">
        <div class="page-header-text">
          <h2 class="page-header-title">${escapeAdmin(title)}</h2>
          ${desc ? `<p class="page-header-desc">${escapeAdmin(desc)}</p>` : ''}
        </div>
        <div class="page-header-actions">${actions}</div>
      </div>
    `;
  }

  function paginate(list, page = 1, perPage = 5) {
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const current = Math.min(Math.max(1, Number(page) || 1), pages);
    const start = (current - 1) * perPage;
    return {
      items: list.slice(start, start + perPage),
      page: current,
      pages,
      total,
      perPage
    };
  }

  function paginationControls(state, dataAttr = 'data-page') {
    if (state.pages <= 1) return '';
    const prev = Math.max(1, state.page - 1);
    const next = Math.min(state.pages, state.page + 1);
    return `
      <div class="pagination">
        <button type="button" class="ad-ghost" ${dataAttr}="${prev}" ${state.page <= 1 ? 'disabled' : ''}>${escapeAdmin(t('prev'))}</button>
        <span class="pagination-info">${state.page} / ${state.pages}</span>
        <button type="button" class="ad-ghost" ${dataAttr}="${next}" ${state.page >= state.pages ? 'disabled' : ''}>${escapeAdmin(t('next'))}</button>
      </div>
    `;
  }

  function salesByDay(orders, days = 30) {
    const map = new Map();
    const now = new Date();
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    (orders || []).forEach((order) => {
      if (order.status === 'cancelled') return;
      const key = String(order.createdAt || '').slice(0, 10);
      if (!map.has(key)) return;
      map.set(key, map.get(key) + Number(order.total || 0));
    });
    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }

  function salesByCategory(orders, products) {
    const productMap = new Map((products || []).map((item) => [String(item.id), item]));
    const totals = new Map();
    (orders || []).forEach((order) => {
      if (order.status === 'cancelled') return;
      (order.items || []).forEach((line) => {
        const product = productMap.get(String(line.productId));
        const category = product?.category || line.category || 'other';
        const amount = Number(line.price || 0) * Number(line.qty || 1);
        totals.set(category, (totals.get(category) || 0) + amount);
      });
    });
    return [...totals.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }

  function topProducts(orders, products, limit = 5) {
    const counts = new Map();
    (orders || []).forEach((order) => {
      if (order.status === 'cancelled') return;
      (order.items || []).forEach((line) => {
        const id = String(line.productId ?? line.sku ?? line.nameEn ?? line.nameAr);
        const current = counts.get(id) || {
          id,
          qty: 0,
          sales: 0,
          nameAr: line.nameAr,
          nameEn: line.nameEn,
          image: line.image,
          price: line.price
        };
        current.qty += Number(line.qty || 1);
        current.sales += Number(line.price || 0) * Number(line.qty || 1);
        counts.set(id, current);
      });
    });
    const catalog = new Map((products || []).map((item) => [String(item.id), item]));
    return [...counts.values()]
      .map((item) => {
        const live = catalog.get(item.id);
        return live ? {
          ...item,
          nameAr: live.nameAr || item.nameAr,
          nameEn: live.nameEn || item.nameEn,
          image: live.image || item.image,
          price: live.price ?? item.price
        } : item;
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);
  }

  function barChart(series, options = {}) {
    const width = options.width || 520;
    const height = options.height || 220;
    const pad = 28;
    const values = series.map((item) => Number(item.value || 0));
    const max = Math.max(1, ...values);
    const gap = 4;
    const barWidth = Math.max(4, (width - pad * 2) / Math.max(1, series.length) - gap);
    const bars = series.map((item, index) => {
      const h = Math.round((Number(item.value || 0) / max) * (height - pad * 2));
      const x = pad + index * (barWidth + gap);
      const y = height - pad - h;
      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="3" fill="currentColor" opacity="${0.35 + (index % 5) * 0.1}"></rect>`;
    }).join('');
    return `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="chart">
        <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="currentColor" opacity="0.15"></line>
        ${bars}
      </svg>
    `;
  }

  function donutChart(series) {
    const total = series.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
    let offset = 0;
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#64748b'];
    const rings = series.map((item, index) => {
      const value = Number(item.value || 0);
      const pct = value / total;
      const dash = pct * 100;
      const circle = `
        <circle r="15.915" cx="18" cy="18" fill="transparent"
          stroke="${colors[index % colors.length]}" stroke-width="4"
          stroke-dasharray="${dash} ${100 - dash}" stroke-dashoffset="${-offset}"></circle>`;
      offset += dash;
      return circle;
    }).join('');
    const legend = series.map((item, index) => `
      <li><span class="legend-dot" style="background:${colors[index % colors.length]}"></span>${escapeAdmin(item.label)} · ${escapeAdmin(money(item.value))}</li>
    `).join('');
    return `
      <div class="donut-wrap">
        <svg class="donut-svg" viewBox="0 0 36 36">${rings}</svg>
        <ul class="chart-legend">${legend || `<li>${escapeAdmin(t('empty'))}</li>`}</ul>
      </div>
    `;
  }

  function buildNotifications() {
    const settings = StoreState.getSettings();
    const low = Number(settings.lowStock || 3);
    const items = [];
    StoreState.getProducts().forEach((product) => {
      const stock = Number(product.stock || 0);
      if (stock <= 0) {
        items.push({
          id: `oos-${product.id}`,
          type: 'stock',
          href: AdminAuth.adminPath('inventory'),
          title: adminLang() === 'en' ? `${product.nameEn} is out of stock` : `${product.nameAr} نفد من المخزن`,
          time: Date.now()
        });
      } else if (stock <= low) {
        items.push({
          id: `low-${product.id}`,
          type: 'stock',
          href: AdminAuth.adminPath('inventory'),
          title: adminLang() === 'en' ? `${product.nameEn} is low (${stock})` : `${product.nameAr} مخزون منخفض (${stock})`,
          time: Date.now()
        });
      }
    });
    StoreState.getOrders().slice(0, 12).forEach((order) => {
      if (['delivered', 'cancelled'].includes(order.status)) return;
      items.push({
        id: `order-${order.orderId}`,
        type: 'order',
        href: `${AdminAuth.adminPath('orders')}?order=${encodeURIComponent(order.orderId)}`,
        title: adminLang() === 'en'
          ? `Open order #${order.orderId} · ${statusLabel(order.status)}`
          : `طلب مفتوح #${order.orderId} · ${statusLabel(order.status)}`,
        time: Date.parse(order.createdAt || '') || Date.now()
      });
    });
    return items.slice(0, 20);
  }

  function readNotifyState() {
    try { return JSON.parse(localStorage.getItem(NOTIFY_KEY) || '{"read":[]}'); }
    catch { return { read: [] }; }
  }

  function markNotificationsRead(ids) {
    const state = readNotifyState();
    const set = new Set([...(state.read || []), ...ids]);
    localStorage.setItem(NOTIFY_KEY, JSON.stringify({ read: [...set].slice(-200) }));
  }

  function unreadCount(items) {
    const read = new Set(readNotifyState().read || []);
    return items.filter((item) => !read.has(item.id)).length;
  }

  return {
    pageHeader,
    paginate,
    paginationControls,
    salesByDay,
    salesByCategory,
    topProducts,
    barChart,
    donutChart,
    buildNotifications,
    markNotificationsRead,
    unreadCount
  };
})();

window.AdminLayout = AdminLayout;
