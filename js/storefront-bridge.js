/**
 * Applies dashboard CMS + live inventory onto the public storefront.
 */
(function storefrontBridge() {
  if (typeof StoreState === 'undefined' || window.TECHPRO_CONFIG?.mode !== 'demo') return;
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;
  StoreState.ensure();

  function applyCmsStrings() {
    const cms = StoreState.getCms();
    const lang = typeof currentLang === 'string' ? currentLang : document.documentElement.lang;
    const pack = cms.strings && cms.strings[lang === 'en' ? 'en' : 'ar'];
    if (pack && typeof translations !== 'undefined' && translations[lang === 'en' ? 'en' : 'ar']) {
      Object.assign(translations[lang === 'en' ? 'en' : 'ar'], pack);
    }
    if (cms.announcement) {
      const banner = document.querySelector('[data-i18n="banner_text"]');
      if (banner) {
        const text = lang === 'en' ? cms.announcement.textEn : cms.announcement.textAr;
        if (cms.announcement.enabled === false) {
          banner.closest('.bg-primary-container')?.style.setProperty('display', 'none');
        } else if (text) {
          banner.textContent = text;
          banner.closest('.bg-primary-container')?.style.removeProperty('display');
        }
      }
    }
  }

  function applyPolicy() {
    const host = document.getElementById('cms-policy-body');
    if (!host) return;
    const cms = StoreState.getCms();
    const key = host.dataset.policy;
    const lang = document.documentElement.lang === 'en' ? 'En' : 'Ar';
    const text = cms.policies && cms.policies[`${key}${lang}`];
    if (text) host.textContent = String(text);
  }

  function applyBranding() {
    if (typeof StoreState.applyDocumentBranding !== 'function') return;
    const lang = typeof currentLang === 'string' ? currentLang : (document.documentElement.lang === 'en' ? 'en' : 'ar');
    const pageLabel = document.body?.dataset?.pageTitle || '';
    StoreState.applyDocumentBranding({
      lang,
      titleSuffix: pageLabel || undefined,
      setTitle: true
    });
  }

  function applyLiveStockUi() {
    document.querySelectorAll('[data-product-id]').forEach((node) => {
      const id = node.getAttribute('data-product-id');
      const product = StoreState.getProduct(id);
      if (!product) return;
      const stock = Number(product.stock || 0);
      node.querySelectorAll('[data-stock-label]').forEach((label) => {
        label.textContent = String(stock);
      });
      node.querySelectorAll('button[data-add-cart], a[data-add-cart], button.add-to-cart').forEach((btn) => {
        btn.disabled = stock <= 0;
        if (stock <= 0) btn.setAttribute('aria-disabled', 'true');
        else btn.removeAttribute('aria-disabled');
      });
      node.classList.toggle('is-out-of-stock', stock <= 0);
    });
  }

  function applyHeaderCategories(categories) {
    const select = document.getElementById('header-category-select');
    if (!select || !Array.isArray(categories) || !categories.length) return;
    const lang = typeof currentLang === 'string' ? currentLang : document.documentElement.lang;
    const current = select.value || 'all';
    const allLabel = lang === 'en' ? 'All departments' : 'جميع الأقسام';
    select.innerHTML = [
      `<option class="bg-inverse-surface text-inverse-on-surface" value="all">${allLabel}</option>`,
      ...categories.filter((item) => item.active !== false).map((item) => {
        const label = lang === 'en' ? (item.nameEn || item.nameAr || item.slug) : (item.nameAr || item.nameEn || item.slug);
        return `<option class="bg-inverse-surface text-inverse-on-surface" value="${String(item.slug).replace(/"/g, '&quot;')}">${String(label).replace(/</g, '&lt;')}</option>`;
      })
    ].join('');
    if ([...select.options].some((opt) => opt.value === current)) select.value = current;
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok && Array.isArray(data.categories)) {
        applyHeaderCategories(data.categories);
        return data.categories;
      }
    } catch {}
    return [];
  }

  function applyNow() {
    try {
      applyCmsStrings();
      if (typeof updateAllTexts === 'function') updateAllTexts();
      applyCmsStrings();
      applyPolicy();
      applyBranding();
      applyLiveStockUi();
      loadCategories();
    } catch {}
  }

  const refresh = StoreState.refreshProductsFromServer?.();
  if (refresh && typeof refresh.finally === 'function') {
    refresh.finally(() => {
      applyNow();
      try { StoreState.connectStockSocket?.(() => applyLiveStockUi()); } catch {}
    });
  } else {
    applyNow();
  }

  document.addEventListener('componentsLoaded', applyNow);
  window.addEventListener('languageChanged', applyNow);
  document.addEventListener('storeStateChanged', applyNow);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyNow);
  else applyNow();
})();
