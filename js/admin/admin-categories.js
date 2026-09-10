let categoriesCache = [];

function categoryLabel(item) {
  if (!item) return '';
  return adminLang() === 'en'
    ? (item.nameEn || item.nameAr || item.slug)
    : (item.nameAr || item.nameEn || item.slug);
}

async function loadCategories({ all = true } = {}) {
  const response = await fetch(`/api/categories${all ? '?all=1' : ''}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok || !Array.isArray(data.categories)) {
    throw new Error(data.error || t('categoriesLoadFailed'));
  }
  categoriesCache = data.categories;
  return categoriesCache;
}

function categoryForm(item = null) {
  const value = item || {
    nameAr: '', nameEn: '', slug: '', icon: 'category', sortOrder: 100, active: true
  };
  return `
    <form id="category-form" class="ad-form-grid" data-id="${item ? escapeAdmin(item.id) : ''}">
      <div class="ad-field"><label>${escapeAdmin(t('categoryNameAr'))}</label>
        <input name="nameAr" required value="${escapeAdmin(value.nameAr || '')}">
      </div>
      <div class="ad-field"><label>${escapeAdmin(t('categoryNameEn'))}</label>
        <input name="nameEn" required value="${escapeAdmin(value.nameEn || '')}">
      </div>
      <div class="ad-field"><label>${escapeAdmin(t('categorySlug'))}</label>
        <input name="slug" value="${escapeAdmin(value.slug || '')}" placeholder="phones">
      </div>
      <div class="ad-field"><label>${escapeAdmin(t('categoryIcon'))}</label>
        <input name="icon" value="${escapeAdmin(value.icon || 'category')}" placeholder="category">
      </div>
      <div class="ad-field"><label>${escapeAdmin(t('categorySort'))}</label>
        <input type="number" name="sortOrder" value="${escapeAdmin(value.sortOrder ?? 100)}">
      </div>
      <div class="ad-field"><label>${escapeAdmin(t('status'))}</label>
        <select name="active">
          <option value="1" ${value.active !== false ? 'selected' : ''}>${escapeAdmin(t('active'))}</option>
          <option value="0" ${value.active === false ? 'selected' : ''}>${escapeAdmin(t('inactive'))}</option>
        </select>
      </div>
      <div class="admin-actions" style="grid-column:1/-1">
        <button type="submit" class="ad-btn">${escapeAdmin(item ? t('save') : t('addCategory'))}</button>
        ${item ? `<button type="button" class="ad-ghost" id="category-cancel">${escapeAdmin(t('cancel'))}</button>` : ''}
      </div>
    </form>
  `;
}

function categoriesTable(list) {
  if (!list.length) {
    return `<p class="ad-note">${escapeAdmin(t('categoriesEmpty'))}</p>`;
  }
  return `
    <div class="ad-table-wrap">
      <table class="ad-table">
        <thead>
          <tr>
            <th>${escapeAdmin(t('categorySort'))}</th>
            <th>${escapeAdmin(t('categorySlug'))}</th>
            <th>${escapeAdmin(t('categoryNameAr'))}</th>
            <th>${escapeAdmin(t('categoryNameEn'))}</th>
            <th>${escapeAdmin(t('status'))}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${list.map((item) => `
            <tr>
              <td>${escapeAdmin(item.sortOrder)}</td>
              <td><code>${escapeAdmin(item.slug)}</code></td>
              <td>${escapeAdmin(item.nameAr)}</td>
              <td>${escapeAdmin(item.nameEn)}</td>
              <td>${escapeAdmin(item.active !== false ? t('active') : t('inactive'))}</td>
              <td class="admin-actions">
                <button type="button" class="ad-ghost" data-edit-category="${escapeAdmin(item.id)}">${escapeAdmin(t('edit'))}</button>
                <button type="button" class="ad-danger" data-del-category="${escapeAdmin(item.id)}">${escapeAdmin(t('delete'))}</button>
                <button type="button" class="ad-ghost" data-move-category="${escapeAdmin(item.id)}" data-dir="-1">↑</button>
                <button type="button" class="ad-ghost" data-move-category="${escapeAdmin(item.id)}" data-dir="1">↓</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function saveCategoryPayload(id, payload) {
  const response = await fetch(id ? `/api/admin/categories/${encodeURIComponent(id)}` : '/api/admin/categories', {
    method: id ? 'PUT' : 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || t('categoriesSaveFailed'));
  return data.category;
}

function renderCategories() {
  mountAdmin(`
    ${AdminLayout.pageHeader({
      title: t('categories'),
      desc: t('categoriesDesc')
    })}
    <div class="ad-card" id="category-form-card">${categoryForm()}</div>
    <div class="ad-card" style="margin-top:1rem" id="categories-list"><p class="ad-note">${escapeAdmin(t('loading'))}</p></div>
  `);

  const listHost = document.getElementById('categories-list');
  const formCard = document.getElementById('category-form-card');

  async function refresh() {
    try {
      const list = await loadCategories({ all: true });
      if (listHost) listHost.innerHTML = categoriesTable(list);
    } catch (error) {
      if (listHost) listHost.innerHTML = `<p class="ad-note">${escapeAdmin(error.message || t('categoriesLoadFailed'))}</p>`;
    }
  }

  function bindForm() {
    document.getElementById('category-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      const id = form.dataset.id || '';
      try {
        await saveCategoryPayload(id || null, {
          nameAr: data.get('nameAr'),
          nameEn: data.get('nameEn'),
          slug: data.get('slug'),
          icon: data.get('icon'),
          sortOrder: Number(data.get('sortOrder') || 100),
          active: data.get('active') !== '0'
        });
        adminToast(t('saved'));
        if (formCard) formCard.innerHTML = categoryForm();
        bindForm();
        await refresh();
      } catch (error) {
        adminToast(error.message || t('categoriesSaveFailed'));
      }
    });
    document.getElementById('category-cancel')?.addEventListener('click', () => {
      if (formCard) formCard.innerHTML = categoryForm();
      bindForm();
    });
  }

  listHost?.addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-edit-category]');
    if (edit) {
      const item = categoriesCache.find((row) => String(row.id) === String(edit.dataset.editCategory));
      if (!item || !formCard) return;
      formCard.innerHTML = categoryForm(item);
      bindForm();
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const del = event.target.closest('[data-del-category]');
    if (del) {
      const confirmed = window.TechProDialog
        ? await TechProDialog.confirm(t('categoryDeleteConfirm'), { tone: 'danger' })
        : false;
      if (!confirmed) return;
      try {
        let response = await fetch(`/api/admin/categories/${encodeURIComponent(del.dataset.delCategory)}`, {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        let data = await response.json().catch(() => ({}));
        if (response.status === 409) {
          const force = window.TechProDialog
            ? await TechProDialog.confirm(data.error || t('categoryForceDelete'), { tone: 'danger' })
            : false;
          if (!force) return;
          response = await fetch(`/api/admin/categories/${encodeURIComponent(del.dataset.delCategory)}?force=1`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: { Accept: 'application/json' }
          });
          data = await response.json().catch(() => ({}));
        }
        if (!response.ok || !data.ok) throw new Error(data.error || t('categoriesSaveFailed'));
        adminToast(t('saved'));
        await refresh();
      } catch (error) {
        adminToast(error.message || t('categoriesSaveFailed'));
      }
      return;
    }

    const move = event.target.closest('[data-move-category]');
    if (!move) return;
    const id = Number(move.dataset.moveCategory);
    const dir = Number(move.dataset.dir);
    const sorted = [...categoriesCache].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const index = sorted.findIndex((item) => Number(item.id) === id);
    const swap = sorted[index + dir];
    if (index < 0 || !swap) return;
    try {
      await saveCategoryPayload(sorted[index].id, { ...sorted[index], sortOrder: swap.sortOrder });
      await saveCategoryPayload(swap.id, { ...swap, sortOrder: sorted[index].sortOrder });
      await refresh();
    } catch (error) {
      adminToast(error.message || t('categoriesSaveFailed'));
    }
  });

  bindForm();
  refresh().catch(() => {});
}

window.renderCategories = renderCategories;
window.loadAdminCategories = loadCategories;
window.categoryLabel = categoryLabel;
