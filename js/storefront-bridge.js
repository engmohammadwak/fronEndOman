/**
 * Applies dashboard CMS + live inventory onto the public storefront.
 */
(function storefrontBridge() {
  if (typeof StoreState === 'undefined' || window.TECHPRO_CONFIG?.mode !== 'demo') return;
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
    const lang = typeof currentLang === 'string' ? currentLang : (document.documentElement.lang === 'en' ? 'en' : 'ar');
    const pageLabel = document.body?.dataset?.pageTitle || '';
    StoreState.applyDocumentBranding({
      lang,
      titleSuffix: pageLabel || undefined,
      setTitle: true
    });
  }

  function applyNow() {
    applyCmsStrings();
    if (typeof updateAllTexts === 'function') updateAllTexts();
    applyCmsStrings();
    applyPolicy();
    applyBranding();
  }

  document.addEventListener('componentsLoaded', applyNow);
  window.addEventListener('languageChanged', applyNow);
  document.addEventListener('storeStateChanged', applyNow);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyNow);
  else applyNow();
})();
