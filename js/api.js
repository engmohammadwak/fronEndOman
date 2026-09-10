function isDemoMode() { return window.TECHPRO_CONFIG?.mode !== 'live'; }
async function requestBackend(path, options = {}) {
  // Always same-origin relative /api — never hardcode http(s)://host (breaks Secure cookies).
  const clean = String(path || '').replace(/^\/+/, '');
  const url = `/api/${clean}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), window.TECHPRO_CONFIG?.requestTimeoutMs || 15000);
  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `API request failed (${response.status})`);
      error.status = response.status;
      error.code = data.code;
      error.body = data;
      throw error;
    }
    return data;
  } finally { clearTimeout(timer); }
}
async function requestApi(path, options = {}) {
  if (isDemoMode() && window.TECHPRO_CONFIG?.demoApiReads === false) throw new Error('Preview uses local data');
  const clean = String(path || '').replace(/^\/+/, '');
  const url = `/api/${clean}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), window.TECHPRO_CONFIG?.requestTimeoutMs || 5000);
  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
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
