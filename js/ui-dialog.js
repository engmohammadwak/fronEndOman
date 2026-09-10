/**
 * Shared branded dialogs for storefront + dashboard.
 * Replaces native alert / confirm / prompt UX.
 */
(function techProUiDialog(global) {
  if (global.TechProDialog) return;

  const STYLE_ID = 'techpro-ui-dialog-style';
  const ROOT_ID = 'techpro-ui-dialog-root';

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isRtl() {
    return (document.documentElement.dir || document.documentElement.lang || 'ar')
      .toLowerCase()
      .startsWith('ar') || document.documentElement.dir === 'rtl';
  }

  function copy() {
    const ar = isRtl();
    return {
      ok: ar ? 'حسناً' : 'OK',
      cancel: ar ? 'إلغاء' : 'Cancel',
      confirm: ar ? 'تأكيد' : 'Confirm',
      close: ar ? 'إغلاق' : 'Close'
    };
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: grid;
        place-items: center;
        padding: 1.25rem;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        font-family: Cairo, "Segoe UI", sans-serif;
      }
      #${ROOT_ID}[hidden] { display: none !important; }
      #${ROOT_ID} .tpd-card {
        width: min(100%, 420px);
        background: #fff;
        color: #0f172a;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
        border: 1px solid rgba(226, 232, 240, 0.9);
        overflow: hidden;
        animation: tpd-in 0.18s ease-out;
      }
      @keyframes tpd-in {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to { opacity: 1; transform: none; }
      }
      #${ROOT_ID} .tpd-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 1.1rem 1.15rem 0.35rem;
      }
      #${ROOT_ID} .tpd-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        line-height: 1.35;
      }
      #${ROOT_ID} .tpd-close {
        border: 0;
        background: #f1f5f9;
        color: #475569;
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        cursor: pointer;
        font-size: 1.1rem;
        line-height: 1;
        flex-shrink: 0;
      }
      #${ROOT_ID} .tpd-close:hover { background: #e2e8f0; }
      #${ROOT_ID} .tpd-body {
        padding: 0.5rem 1.15rem 1rem;
        color: #334155;
        font-size: 0.95rem;
        line-height: 1.55;
      }
      #${ROOT_ID} .tpd-message { margin: 0 0 0.85rem; white-space: pre-wrap; }
      #${ROOT_ID} .tpd-fields { display: grid; gap: 0.75rem; }
      #${ROOT_ID} .tpd-field { display: grid; gap: 0.35rem; }
      #${ROOT_ID} .tpd-field label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #64748b;
      }
      #${ROOT_ID} .tpd-field input,
      #${ROOT_ID} .tpd-field textarea,
      #${ROOT_ID} .tpd-field select {
        width: 100%;
        min-height: 44px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.55rem 0.75rem;
        font: inherit;
        font-weight: 600;
        color: #0f172a;
        background: #f8fafc;
        box-sizing: border-box;
      }
      #${ROOT_ID} .tpd-field input:focus,
      #${ROOT_ID} .tpd-field textarea:focus,
      #${ROOT_ID} .tpd-field select:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        background: #fff;
      }
      #${ROOT_ID} .tpd-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        justify-content: flex-end;
        padding: 0 1.15rem 1.15rem;
      }
      #${ROOT_ID} .tpd-btn {
        min-height: 42px;
        border-radius: 10px;
        border: 1px solid transparent;
        padding: 0.55rem 1rem;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }
      #${ROOT_ID} .tpd-btn-primary {
        background: #4f46e5;
        color: #fff;
      }
      #${ROOT_ID} .tpd-btn-primary:hover { background: #4338ca; }
      #${ROOT_ID} .tpd-btn-ghost {
        background: #fff;
        border-color: #e2e8f0;
        color: #334155;
      }
      #${ROOT_ID} .tpd-btn-ghost:hover { background: #f8fafc; }
      #${ROOT_ID} .tpd-btn-danger {
        background: #ba1a1a;
        color: #fff;
      }
      #${ROOT_ID} .tpd-btn-danger:hover { background: #9f1239; }
      body.tpd-open { overflow: hidden; }
    `;
    document.head.appendChild(style);
  }

  function getRoot() {
    ensureStyle();
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      root.hidden = true;
      root.setAttribute('role', 'presentation');
      document.body.appendChild(root);
    }
    return root;
  }

  let activeCloser = null;

  function closeActive(result) {
    const closer = activeCloser;
    activeCloser = null;
    const root = document.getElementById(ROOT_ID);
    if (root) {
      root.hidden = true;
      root.replaceChildren();
    }
    document.body.classList.remove('tpd-open');
    if (closer) closer(result);
  }

  function openDialog(options = {}) {
    const labels = copy();
    const root = getRoot();
    const title = options.title || '';
    const message = options.message || '';
    const tone = options.tone === 'danger' ? 'danger' : 'primary';
    const fields = Array.isArray(options.fields) ? options.fields : [];
    const showCancel = options.showCancel !== false;
    const confirmLabel = options.confirmText || (fields.length || options.mode === 'confirm' ? labels.confirm : labels.ok);
    const cancelLabel = options.cancelText || labels.cancel;

    return new Promise((resolve) => {
      if (activeCloser) closeActive(null);

      activeCloser = resolve;
      document.body.classList.add('tpd-open');
      root.hidden = false;
      root.dir = isRtl() ? 'rtl' : 'ltr';
      root.innerHTML = `
        <div class="tpd-card" role="dialog" aria-modal="true" aria-labelledby="tpd-title">
          <div class="tpd-head">
            <h3 class="tpd-title" id="tpd-title">${escapeHtml(title || message || labels.ok)}</h3>
            <button type="button" class="tpd-close" data-tpd-cancel aria-label="${escapeHtml(labels.close)}">×</button>
          </div>
          <div class="tpd-body">
            ${title && message ? `<p class="tpd-message">${escapeHtml(message)}</p>` : ''}
            ${fields.length ? `<div class="tpd-fields">
              ${fields.map((field, index) => `
                <div class="tpd-field">
                  <label for="tpd-field-${index}">${escapeHtml(field.label || field.name || '')}</label>
                  <input
                    id="tpd-field-${index}"
                    name="${escapeHtml(field.name || `field${index}`)}"
                    type="${escapeHtml(field.type || 'text')}"
                    value="${escapeHtml(field.value ?? '')}"
                    placeholder="${escapeHtml(field.placeholder || '')}"
                    ${field.required ? 'required' : ''}
                    ${field.min != null ? `min="${escapeHtml(field.min)}"` : ''}
                    ${field.step != null ? `step="${escapeHtml(field.step)}"` : ''}
                    autocomplete="off"
                  >
                </div>
              `).join('')}
            </div>` : ''}
          </div>
          <div class="tpd-actions">
            ${showCancel ? `<button type="button" class="tpd-btn tpd-btn-ghost" data-tpd-cancel>${escapeHtml(cancelLabel)}</button>` : ''}
            <button type="button" class="tpd-btn ${tone === 'danger' ? 'tpd-btn-danger' : 'tpd-btn-primary'}" data-tpd-ok>${escapeHtml(confirmLabel)}</button>
          </div>
        </div>
      `;

      const firstInput = root.querySelector('input');
      const okBtn = root.querySelector('[data-tpd-ok]');
      const finishOk = () => {
        if (fields.length) {
          const values = {};
          let valid = true;
          root.querySelectorAll('.tpd-field input').forEach((input) => {
            if (input.required && !String(input.value || '').trim()) {
              valid = false;
              input.focus();
            }
            values[input.name] = input.value;
          });
          if (!valid) return;
          closeActive(values);
          return;
        }
        if (options.mode === 'prompt') {
          const input = root.querySelector('input');
          closeActive(input ? input.value : '');
          return;
        }
        closeActive(true);
      };

      root.querySelectorAll('[data-tpd-cancel]').forEach((btn) => {
        btn.addEventListener('click', () => closeActive(options.mode === 'confirm' ? false : null));
      });
      okBtn?.addEventListener('click', finishOk);
      root.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeActive(options.mode === 'confirm' ? false : null);
        }
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
          event.preventDefault();
          finishOk();
        }
      });
      root.addEventListener('click', (event) => {
        if (event.target === root) closeActive(options.mode === 'confirm' ? false : null);
      });

      setTimeout(() => {
        (firstInput || okBtn)?.focus();
        if (firstInput && typeof firstInput.select === 'function' && firstInput.value) firstInput.select();
      }, 10);
    });
  }

  async function alertDialog(message, options = {}) {
    await openDialog({
      title: options.title || '',
      message: String(message ?? ''),
      showCancel: false,
      confirmText: options.okText || copy().ok,
      mode: 'alert'
    });
  }

  async function confirmDialog(message, options = {}) {
    const result = await openDialog({
      title: options.title || (isRtl() ? 'تأكيد' : 'Confirm'),
      message: String(message ?? ''),
      showCancel: true,
      confirmText: options.confirmText || copy().confirm,
      cancelText: options.cancelText || copy().cancel,
      tone: options.tone || 'primary',
      mode: 'confirm'
    });
    return result === true;
  }

  async function promptDialog(message, defaultValue = '', options = {}) {
    const values = await openDialog({
      title: options.title || String(message ?? ''),
      message: options.title ? String(message ?? '') : '',
      showCancel: true,
      confirmText: options.confirmText || copy().ok,
      cancelText: options.cancelText || copy().cancel,
      mode: 'form',
      fields: [{
        name: 'value',
        label: options.label || (options.title ? String(message ?? '') : (isRtl() ? 'القيمة' : 'Value')),
        type: options.inputType || 'text',
        value: defaultValue ?? '',
        placeholder: options.placeholder || '',
        required: options.required !== false
      }]
    });
    if (!values || values.value == null) return null;
    return String(values.value);
  }

  async function formDialog(options = {}) {
    return openDialog({
      title: options.title || '',
      message: options.message || '',
      fields: options.fields || [],
      showCancel: options.showCancel !== false,
      confirmText: options.confirmText || copy().confirm,
      cancelText: options.cancelText || copy().cancel,
      tone: options.tone || 'primary',
      mode: 'form'
    });
  }

  const api = {
    alert: alertDialog,
    confirm: confirmDialog,
    prompt: promptDialog,
    form: formDialog,
    close: () => closeActive(null)
  };

  global.TechProDialog = api;

  // Soft native override when alert exists (browser). Skip in non-DOM test VMs.
  if (typeof global.alert === 'function') {
    const nativeAlert = global.alert.bind(global);
    global.alert = function patchedAlert(message) {
      if (!global.document || !global.document.body) return nativeAlert(message);
      alertDialog(message).catch(() => nativeAlert(message));
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
