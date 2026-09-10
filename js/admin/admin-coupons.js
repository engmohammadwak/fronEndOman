function renderCoupons() {
  const list = StoreState.getCoupons();
  mountAdmin(`
    ${AdminLayout.pageHeader({ title: t('coupons'), desc: pageDescription('coupons'), actions: `<button class="ad-btn" id="add-coupon">${escapeAdmin(t('add'))}</button>` })}
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

