const apiAppRoot = new URL('../', document.currentScript.src);
function isDemoMode() { return window.TECHPRO_CONFIG?.mode !== 'live'; }
async function requestApi(path, options = {}) {
  if (isDemoMode() && window.TECHPRO_CONFIG?.demoApiReads === false) throw new Error('Preview uses local data');
  const base = new URL(window.TECHPRO_CONFIG?.apiBase || 'api/', apiAppRoot);
  const url = new URL(String(path).replace(/^\//, ''), base);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), window.TECHPRO_CONFIG?.requestTimeoutMs || 5000);
  try {
    const response = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', ...options.headers },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`API request failed (${response.status})`);
    return await response.json();
  } finally { clearTimeout(timer); }
}
function apiList(result) {
  const list = Array.isArray(result) ? result : result?.data;
  if (!Array.isArray(list)) throw new Error('Invalid API list');
  return list;
}
function showApiError() {
  const host = document.getElementById('demo-data-notice');
  if (!host) return;
  host.dataset.apiError = 'true';
  host.classList.remove('hidden');
  host.removeAttribute('data-i18n');
  host.textContent = document.documentElement.lang === 'en'
    ? 'Unable to load data. Please try again.' : 'تعذّر تحميل البيانات. يرجى المحاولة مجددًا.';
}
