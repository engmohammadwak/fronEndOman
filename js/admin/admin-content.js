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

