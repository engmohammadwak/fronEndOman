function secretPlaceholder(hasValue) {
  return hasValue ? '••••••••' : '';
}

function renderPayments() {
  const fallback = `<div class="ad-card"><h2 style="margin-top:0">${escapeAdmin(t('paymobTitle'))}</h2><p class="ad-note">${escapeAdmin(t('paymobHint'))}</p></div>`;
  mountAdmin(fallback);
  if (typeof requestBackend !== 'function') return;
  requestBackend('admin/paymob').then((config) => {
    mountAdmin(`
      <div class="ad-card">
        <h2 style="margin-top:0">${escapeAdmin(t('paymobTitle'))}</h2>
        <p class="ad-note" style="margin-bottom:1rem">${escapeAdmin(t('paymobHint'))}</p>
        <form id="paymob-form" class="ad-grid-2">
          <div class="ad-field" style="grid-column:1/-1">
            <label><input type="checkbox" name="enabled" value="1" ${config.enabled ? 'checked' : ''}> ${escapeAdmin(t('paymobEnabled'))}</label>
          </div>
          <div class="ad-field">
            <label>${escapeAdmin(t('paymobBase'))}</label>
            <select name="baseUrl">
              ${[
                ['https://oman.paymob.com', 'Oman'],
                ['https://accept.paymob.com', 'Egypt / Accept'],
                ['https://uae.paymob.com', 'UAE'],
                ['https://ksa.paymob.com', 'KSA']
              ].map(([value, label]) => `<option value="${value}" ${config.baseUrl === value ? 'selected' : ''}>${label} — ${value}</option>`).join('')}
            </select>
          </div>
          <div class="ad-field">
            <label>${escapeAdmin(t('paymobMode'))}</label>
            <select name="mode" id="paymob-mode">
              <option value="intention" ${config.mode !== 'iframe' ? 'selected' : ''}>${escapeAdmin(t('paymobIntention'))}</option>
              <option value="iframe" ${config.mode === 'iframe' ? 'selected' : ''}>${escapeAdmin(t('paymobIframe'))}</option>
            </select>
          </div>
          <div class="ad-field"><label>${escapeAdmin(t('paymobCurrency'))}</label><input name="currency" value="${escapeAdmin(config.currency || 'OMR')}"></div>
          <div class="ad-field"><label>${escapeAdmin(t('paymobMultiplier'))}</label><input name="amountMultiplier" type="number" min="1" value="${escapeAdmin(config.amountMultiplier || 1000)}"></div>
          <div class="ad-field"><label>${escapeAdmin(t('paymobIntegration'))}</label><input name="integrationId" value="${escapeAdmin(config.integrationId || '')}"></div>
          <div class="ad-field paymob-iframe-only"><label>${escapeAdmin(t('paymobIframeId'))}</label><input name="iframeId" value="${escapeAdmin(config.iframeId || '')}"></div>
          <div class="ad-field" style="grid-column:1/-1"><label>${escapeAdmin(t('paymobSecret'))}</label><input name="secretKey" type="password" autocomplete="off" placeholder="${escapeAdmin(secretPlaceholder(config.hasSecretKey) || t('keepExisting'))}"></div>
          <div class="ad-field" style="grid-column:1/-1"><label>${escapeAdmin(t('paymobPublic'))}</label><input name="publicKey" autocomplete="off" value="${escapeAdmin(config.publicKey || '')}" placeholder="${escapeAdmin(t('keepExisting'))}"></div>
          <div class="ad-field" style="grid-column:1/-1"><label>${escapeAdmin(t('paymobHmac'))}</label><input name="hmacSecret" type="password" autocomplete="off" placeholder="${escapeAdmin(secretPlaceholder(config.hasHmac) || t('keepExisting'))}"></div>
          <div class="ad-field paymob-iframe-only" style="grid-column:1/-1"><label>${escapeAdmin(t('paymobApiKey'))}</label><input name="apiKey" type="password" autocomplete="off" placeholder="${escapeAdmin(secretPlaceholder(config.hasApiKey) || t('keepExisting'))}"></div>
          <p class="ad-note" style="grid-column:1/-1">${escapeAdmin(t('keepExisting'))}</p>
          <div class="admin-actions" style="grid-column:1/-1"><button class="ad-btn" type="submit">${escapeAdmin(t('save'))}</button></div>
        </form>
      </div>
    `);
    const toggleMode = () => {
      const iframe = document.getElementById('paymob-mode')?.value === 'iframe';
      document.querySelectorAll('.paymob-iframe-only').forEach((node) => { node.style.display = iframe ? '' : 'none'; });
    };
    toggleMode();
    document.getElementById('paymob-mode')?.addEventListener('change', toggleMode);
    document.getElementById('paymob-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const payload = Object.fromEntries(data.entries());
      payload.enabled = data.get('enabled') === '1';
      try {
        await requestBackend('admin/paymob', { method: 'PUT', body: JSON.stringify(payload) });
        adminToast(t('paymobSaved'));
        renderPayments();
      } catch (error) {
        adminToast(error.status === 401 ? t('paymobNeedLogin') : (error.message || t('badLogin')));
      }
    });
  }).catch((error) => {
    const host = document.getElementById('admin-page');
    if (host) host.innerHTML = `<div class="ad-card"><p class="ad-note">${escapeAdmin(error.status === 401 ? t('paymobNeedLogin') : (error.message || t('paymobNeedLogin')))}</p></div>`;
  });
}

