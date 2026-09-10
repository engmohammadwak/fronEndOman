import { withConnection, withTransaction, mysqlConfigured } from './mysql.mjs';
import { readStore, updateStore } from './db.mjs';

export const DEFAULT_CATEGORIES = [
  { slug: 'phones', nameAr: 'هواتف ذكية', nameEn: 'Smartphones', icon: 'smartphone', sortOrder: 10 },
  { slug: 'laptops', nameAr: 'لابتوبات', nameEn: 'Laptops', icon: 'laptop_mac', sortOrder: 20 },
  { slug: 'tablets', nameAr: 'أجهزة لوحية', nameEn: 'Tablets', icon: 'tablet_mac', sortOrder: 30 },
  { slug: 'watches', nameAr: 'ساعات', nameEn: 'Watches', icon: 'watch', sortOrder: 40 },
  { slug: 'gaming', nameAr: 'ألعاب', nameEn: 'Gaming', icon: 'sports_esports', sortOrder: 50 },
  { slug: 'accessories', nameAr: 'إكسسوارات', nameEn: 'Accessories', icon: 'headphones', sortOrder: 60 },
  { slug: 'other', nameAr: 'أخرى', nameEn: 'Other', icon: 'category', sortOrder: 90 }
];

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || `cat-${Date.now()}`;
}

export function mapCategoryRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    slug: row.slug,
    nameAr: row.name_ar ?? row.nameAr,
    nameEn: row.name_en ?? row.nameEn,
    icon: row.icon || '',
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    active: row.is_active !== 0 && row.is_active !== false && row.active !== false,
    createdAt: row.created_at ?? row.createdAt ?? null
  };
}

function localizedName(category, lang = 'ar') {
  if (!category) return '';
  return lang === 'en'
    ? (category.nameEn || category.nameAr || category.slug)
    : (category.nameAr || category.nameEn || category.slug);
}

function ensureLocalDefaults() {
  return updateStore((store) => {
    if (!Array.isArray(store.categories) || !store.categories.length) {
      const now = new Date().toISOString();
      store.categories = DEFAULT_CATEGORIES.map((item, index) => ({
        id: index + 1,
        slug: item.slug,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        icon: item.icon,
        sortOrder: item.sortOrder,
        active: true,
        createdAt: now
      }));
    }
    if (!Array.isArray(store.products)) store.products = [];
    return store;
  });
}

function listLocal({ activeOnly = true } = {}) {
  ensureLocalDefaults();
  const list = (readStore().categories || []).map(mapCategoryRow).filter(Boolean);
  const filtered = activeOnly ? list.filter((item) => item.active) : list;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

async function listMysql({ activeOnly = true } = {}) {
  return withConnection(async (connection) => {
    const [rows] = await connection.query(
      activeOnly
        ? 'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
        : 'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
    );
    if (!rows.length) {
      for (const item of DEFAULT_CATEGORIES) {
        await connection.query(
          `INSERT INTO categories (slug, name_ar, name_en, icon, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, 1)
           ON DUPLICATE KEY UPDATE name_ar = VALUES(name_ar), name_en = VALUES(name_en)`,
          [item.slug, item.nameAr, item.nameEn, item.icon, item.sortOrder]
        );
      }
      const [seeded] = await connection.query(
        activeOnly
          ? 'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
          : 'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
      );
      return seeded.map(mapCategoryRow);
    }
    return rows.map(mapCategoryRow);
  });
}

export async function listCategories({ activeOnly = true } = {}) {
  if (mysqlConfigured()) {
    try {
      return await listMysql({ activeOnly });
    } catch (error) {
      console.error('[categories] MySQL list failed, using local store:', error.message);
    }
  }
  return listLocal({ activeOnly });
}

export async function getCategoryById(id) {
  const list = await listCategories({ activeOnly: false });
  return list.find((item) => Number(item.id) === Number(id)) || null;
}

async function countProductsForSlug(slug) {
  if (mysqlConfigured()) {
    try {
      return await withConnection(async (connection) => {
        const [rows] = await connection.query(
          'SELECT COUNT(*) AS total FROM products WHERE category = ?',
          [slug]
        );
        return Number(rows[0]?.total || 0);
      });
    } catch {
      /* fall through */
    }
  }
  ensureLocalDefaults();
  return (readStore().products || []).filter((item) => String(item.category) === String(slug)).length;
}

export async function createCategory(input = {}) {
  const nameAr = String(input.nameAr || input.name_ar || '').trim();
  const nameEn = String(input.nameEn || input.name_en || '').trim();
  if (!nameAr || !nameEn) {
    throw Object.assign(new Error('name_ar and name_en are required'), { status: 400 });
  }
  const slug = slugify(input.slug || nameEn || nameAr);
  const icon = String(input.icon || 'category').trim().slice(0, 64);
  const sortOrder = Number.isFinite(Number(input.sortOrder ?? input.sort_order))
    ? Number(input.sortOrder ?? input.sort_order)
    : 100;
  const active = input.active !== false && input.is_active !== 0 && input.is_active !== false;

  if (mysqlConfigured()) {
    try {
      return await withTransaction(async (connection) => {
        const [result] = await connection.query(
          `INSERT INTO categories (slug, name_ar, name_en, icon, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [slug, nameAr, nameEn, icon, sortOrder, active ? 1 : 0]
        );
        const [rows] = await connection.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        return mapCategoryRow(rows[0]);
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw Object.assign(new Error('Category slug already exists'), { status: 409 });
      }
      throw error;
    }
  }

  ensureLocalDefaults();
  let created = null;
  updateStore((store) => {
    if ((store.categories || []).some((item) => item.slug === slug)) {
      throw Object.assign(new Error('Category slug already exists'), { status: 409 });
    }
    const id = Math.max(0, ...(store.categories || []).map((item) => Number(item.id) || 0)) + 1;
    created = {
      id,
      slug,
      nameAr,
      nameEn,
      icon,
      sortOrder,
      active,
      createdAt: new Date().toISOString()
    };
    store.categories = [...(store.categories || []), created];
    return store;
  });
  return mapCategoryRow(created);
}

export async function updateCategory(id, input = {}) {
  const existing = await getCategoryById(id);
  if (!existing) throw Object.assign(new Error('Category not found'), { status: 404 });

  const nameAr = String(input.nameAr ?? input.name_ar ?? existing.nameAr).trim();
  const nameEn = String(input.nameEn ?? input.name_en ?? existing.nameEn).trim();
  const slug = input.slug != null ? slugify(input.slug) : existing.slug;
  const icon = String(input.icon ?? existing.icon ?? 'category').trim().slice(0, 64);
  const sortOrder = Number.isFinite(Number(input.sortOrder ?? input.sort_order))
    ? Number(input.sortOrder ?? input.sort_order)
    : existing.sortOrder;
  const active = input.active !== undefined
    ? input.active !== false && input.is_active !== 0
    : existing.active;

  if (!nameAr || !nameEn) {
    throw Object.assign(new Error('name_ar and name_en are required'), { status: 400 });
  }

  if (mysqlConfigured()) {
    try {
      return await withTransaction(async (connection) => {
        await connection.query(
          `UPDATE categories
           SET slug = ?, name_ar = ?, name_en = ?, icon = ?, sort_order = ?, is_active = ?
           WHERE id = ?`,
          [slug, nameAr, nameEn, icon, sortOrder, active ? 1 : 0, Number(id)]
        );
        if (slug !== existing.slug) {
          await connection.query('UPDATE products SET category = ? WHERE category = ?', [slug, existing.slug]);
        }
        const [rows] = await connection.query('SELECT * FROM categories WHERE id = ?', [Number(id)]);
        return mapCategoryRow(rows[0]);
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw Object.assign(new Error('Category slug already exists'), { status: 409 });
      }
      throw error;
    }
  }

  ensureLocalDefaults();
  let updated = null;
  updateStore((store) => {
    if ((store.categories || []).some((item) => item.slug === slug && Number(item.id) !== Number(id))) {
      throw Object.assign(new Error('Category slug already exists'), { status: 409 });
    }
    store.categories = (store.categories || []).map((item) => {
      if (Number(item.id) !== Number(id)) return item;
      updated = { ...item, slug, nameAr, nameEn, icon, sortOrder, active };
      return updated;
    });
    store.products = (store.products || []).map((item) => (
      item.category === existing.slug ? { ...item, category: slug } : item
    ));
    return store;
  });
  return mapCategoryRow(updated);
}

export async function deleteCategory(id, { force = false } = {}) {
  const existing = await getCategoryById(id);
  if (!existing) throw Object.assign(new Error('Category not found'), { status: 404 });
  const assigned = await countProductsForSlug(existing.slug);
  if (assigned > 0 && !force) {
    throw Object.assign(
      new Error(`Category is assigned to ${assigned} product(s). Reassign products or pass force=1 to soft-delete.`),
      { status: 409, assigned }
    );
  }

  if (mysqlConfigured()) {
    await withConnection(async (connection) => {
      await connection.query('UPDATE categories SET is_active = 0 WHERE id = ?', [Number(id)]);
    });
    return { ok: true, softDeleted: true, id: Number(id), assigned };
  }

  ensureLocalDefaults();
  updateStore((store) => {
    store.categories = (store.categories || []).map((item) => (
      Number(item.id) === Number(id) ? { ...item, active: false } : item
    ));
    return store;
  });
  return { ok: true, softDeleted: true, id: Number(id), assigned };
}

export { localizedName, slugify };
