let settingsTab = 'store';

const BRAND_MAX_BYTES = 400 * 1024;

function settingsTabs() {
  return [
    ['store', t('storeSettings')],
    ['shipping', t('shippingSettings')],
    ['payment', t('paymentSettings')],
    ['notify', t('notifySettings')],
    ['users', t('usersSettings')],
    ['profile', t('profileSettings')]
  ];
}

function isDefaultBrandAsset(value) {
  const raw = String(value || '').trim();
  return !raw || raw === StoreState.DEFAULT_LOGO;
}

/** Custom uploaded/data URLs only — never expose the bundled default path in the form. */
function brandCustomValue(value) {
  return isDefaultBrandAsset(value) ? '' : String(value).trim();
}

function brandField(id, label, value, hint, previewFallback) {
  const custom = brandCustomValue(value);
  const src = custom || previewFallback || StoreState.DEFAULT_LOGO;
  return `
    <div class="ad-field brand-upload-field">
      <label>${escapeAdmin(label)}</label>
      <div class="brand-upload-row">
        <img class="brand-preview" id="${id}-preview" src="${escapeAdmin(src)}" alt="">
        <div class="brand-upload-controls">
          <input type="hidden" name="${id}" id="${id}-value" value="${escapeAdmin(custom)}">
          <div class="admin-actions" style="margin:0;gap:0.5rem">
            <label class="ad-ghost" style="cursor:pointer;margin:0">
              ${escapeAdmin(t('uploadImage'))}
              <input type="file" id="${id}-file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico" hidden>
            </label>
            <button type="button" class="ad-ghost" data-brand-reset="${id}">${escapeAdmin(t('resetBrand'))}</button>
          </div>
          <p class="ad-note" style="margin:0.4rem 0 0">${escapeAdmin(hint)}</p>
        </div>
      </div>
    </div>
  `;
}

function bindBrandAsset(id, previewFallback) {
  const hidden = document.getElementById(`${id}-value`);
  const preview = document.getElementById(`${id}-preview`);
  const fileInput = document.getElementById(`${id}-file`);
  if (!hidden || !preview) return;

  const syncPreview = (value) => {
    const custom = brandCustomValue(value);
    hidden.value = custom;
    preview.src = custom || previewFallback || StoreState.DEFAULT_LOGO;
  };

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (file.size > BRAND_MAX_BYTES) {
      adminToast(t('imageTooLarge'));
      fileInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      syncPreview(String(reader.result || ''));
    };
    reader.onerror = () => adminToast(t('imageReadFailed'));
    reader.readAsDataURL(file);
  });

  document.querySelector(`[data-brand-reset="${id}"]`)?.addEventListener('click', () => {
    syncPreview('');
    if (fileInput) fileInput.value = '';
  });
}

function renderSettings() {
  const settings = StoreState.getSettings();
  const session = AdminAuth.session() || {};
  const logoCustom = brandCustomValue(settings.logoUrl);
  const faviconCustom = brandCustomValue(settings.faviconUrl);
  const adminLogoCustom = brandCustomValue(settings.adminLogoUrl);
  const logoPreview = logoCustom || StoreState.DEFAULT_LOGO;
  mountAdmin(`
    ${AdminLayout.pageHeader({ title: t('settings'), desc: pageDescription('settings') })}
    <div class="ad-tabs">
      ${settingsTabs().map(([key, label]) => `
        <button type="button" class="ad-tab ${settingsTab === key ? 'is-active' : ''}" data-settings-tab="${key}">${escapeAdmin(label)}</button>
      `).join('')}
    </div>
    <div class="ad-card">
      <form id="settings-form">
        <div ${settingsTab === 'store' ? '' : 'hidden'}>
          <h3 class="settings-section-title">${escapeAdmin(t('brandingSection'))}</h3>
          <div class="ad-grid-2">
            <div class="ad-field"><label>${escapeAdmin(t('storeNameAr'))}</label><input name="storeNameAr" required value="${escapeAdmin(settings.storeNameAr || '')}"></div>
            <div class="ad-field"><label>${escapeAdmin(t('storeNameEn'))}</label><input name="storeNameEn" required value="${escapeAdmin(settings.storeNameEn || '')}"></div>
          </div>
          ${brandField('logoUrl', t('siteLogo'), logoCustom, t('logoHint'))}
          ${brandField('faviconUrl', t('siteFavicon'), faviconCustom, t('faviconHint'), logoPreview)}
          ${brandField('adminLogoUrl', t('adminLogo'), adminLogoCustom, t('adminLogoHint'), logoPreview)}
          <hr class="settings-divider">
          <div class="ad-grid-2">
            <div class="ad-field"><label>WhatsApp</label><input name="whatsappAdmin" value="${escapeAdmin(settings.whatsappAdmin || '')}"></div>
            <div class="ad-field"><label>${escapeAdmin(t('low'))}</label><input name="lowStock" type="number" min="1" value="${escapeAdmin(settings.lowStock || 3)}"></div>
          </div>
        </div>
        <div ${settingsTab === 'shipping' ? '' : 'hidden'}>
          <div class="ad-grid-2">
            <div class="ad-field"><label>${escapeAdmin(t('shippingFee'))}</label><input name="shippingFee" type="number" min="0" step="0.01" value="${escapeAdmin(settings.shippingFee || 0)}"></div>
            <div class="ad-field"><label>${escapeAdmin(t('freeShippingFrom'))}</label><input name="freeShippingFrom" type="number" min="0" step="0.01" value="${escapeAdmin(settings.freeShippingFrom || 200)}"></div>
          </div>
          <p class="ad-note">${escapeAdmin(t('engineNote'))}</p>
        </div>
        <div ${settingsTab === 'payment' ? '' : 'hidden'}>
          <p class="ad-note">${escapeAdmin(t('paymobHint'))}</p>
          <a class="ad-btn" href="${AdminAuth.adminPath('payments')}">${escapeAdmin(t('payments'))}</a>
        </div>
        <div ${settingsTab === 'notify' ? '' : 'hidden'}>
          <div class="ad-grid-2">
            <div class="ad-field"><label>${escapeAdmin(t('notifyEmail'))}</label>
              <select name="notifyEmail"><option value="1" ${settings.notifyEmail !== false && settings.notifyEmail !== '0' ? 'selected' : ''}>${escapeAdmin(t('enabled'))}</option><option value="0" ${settings.notifyEmail === false || settings.notifyEmail === '0' ? 'selected' : ''}>${escapeAdmin(t('hidden'))}</option></select>
            </div>
            <div class="ad-field"><label>${escapeAdmin(t('notifyWhatsapp'))}</label>
              <select name="notifyWhatsapp"><option value="1" ${settings.notifyWhatsapp !== false && settings.notifyWhatsapp !== '0' ? 'selected' : ''}>${escapeAdmin(t('enabled'))}</option><option value="0" ${settings.notifyWhatsapp === false || settings.notifyWhatsapp === '0' ? 'selected' : ''}>${escapeAdmin(t('hidden'))}</option></select>
            </div>
          </div>
        </div>
        <div ${settingsTab === 'users' ? '' : 'hidden'}>
          <p class="ad-note">${escapeAdmin(adminLang() === 'en' ? 'Single admin account is managed by server credentials.' : 'حساب المدير الحالي يُدار عبر بيانات الخادم.')}</p>
          <div class="ad-field"><label>${escapeAdmin(t('email'))}</label><input value="${escapeAdmin(session.email || '')}" disabled></div>
        </div>
        <div ${settingsTab === 'profile' ? '' : 'hidden'}>
          <div class="ad-grid-2">
            <div class="ad-field"><label>${escapeAdmin(t('adminName'))}</label><input name="adminDisplayName" value="${escapeAdmin(settings.adminDisplayName || session.name || session.email || '')}"></div>
            <div class="ad-field"><label>${escapeAdmin(t('email'))}</label><input value="${escapeAdmin(session.email || '')}" disabled></div>
          </div>
        </div>
        <div class="admin-actions" style="margin-top:1rem">
          <button class="ad-btn" type="submit">${escapeAdmin(t('saveChanges'))}</button>
        </div>
      </form>
    </div>
  `);
  document.querySelectorAll('[data-settings-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      settingsTab = btn.dataset.settingsTab;
      renderSettings();
    });
  });
  bindBrandAsset('logoUrl', StoreState.DEFAULT_LOGO);
  bindBrandAsset('faviconUrl', logoPreview);
  bindBrandAsset('adminLogoUrl', logoPreview);
  document.getElementById('settings-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    data.logoUrl = brandCustomValue(data.logoUrl);
    data.faviconUrl = brandCustomValue(data.faviconUrl);
    data.adminLogoUrl = brandCustomValue(data.adminLogoUrl);
    StoreState.saveSettings(data);
    StoreState.applyDocumentBranding({ admin: true, titleSuffix: adminLang() === 'en' ? 'Admin' : 'لوحة التحكم', lang: adminLang() });
    adminToast(t('saved'));
    renderSettings();
  });
}
