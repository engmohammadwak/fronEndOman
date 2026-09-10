import '../server/env.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { getPool, mysqlConfigured, closePool } from '../server/mysql.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadDemoProducts() {
  const file = path.join(root, 'js/pages/storefront-demo-catalog.js');
  const sandbox = { STOREFRONT_DEMO_PRODUCTS: [] };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return Array.isArray(sandbox.STOREFRONT_DEMO_PRODUCTS) ? sandbox.STOREFRONT_DEMO_PRODUCTS : [];
}

if (!mysqlConfigured()) {
  console.error('Configure DATABASE_URL or MYSQL_* first.');
  process.exit(1);
}

const products = loadDemoProducts();
if (!products.length) {
  console.error('No demo products found to seed.');
  process.exit(1);
}

const pool = getPool();
let inserted = 0;
let updated = 0;

try {
  for (const item of products) {
    const sku = String(item.sku || `TP-${item.id}`);
    const barcode = String(item.barcode || sku);
    const cost = Number((Number(item.price || 0) * 0.75).toFixed(3));
    const [result] = await pool.query(
      `INSERT INTO products (
        sku, barcode, name_ar, name_en, brand, category, listing_type,
        description_ar, description_en, image, cost_price, selling_price, old_price,
        tax_rate, stock_quantity, min_stock_alert, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.00, ?, 5, 1)
      ON DUPLICATE KEY UPDATE
        name_ar = VALUES(name_ar),
        name_en = VALUES(name_en),
        brand = VALUES(brand),
        category = VALUES(category),
        listing_type = VALUES(listing_type),
        description_ar = VALUES(description_ar),
        description_en = VALUES(description_en),
        image = VALUES(image),
        selling_price = VALUES(selling_price),
        old_price = VALUES(old_price),
        stock_quantity = VALUES(stock_quantity),
        is_active = 1`,
      [
        sku,
        barcode,
        item.nameAr || item.nameEn || sku,
        item.nameEn || null,
        item.brand || null,
        item.category || null,
        item.listingType || 'new',
        item.extraAr || null,
        item.extraEn || null,
        item.image || null,
        cost,
        Number(item.price || 0),
        item.oldPrice != null && item.oldPrice !== '' ? Number(item.oldPrice) : null,
        Math.max(0, Number(item.stock || 0))
      ]
    );
    if (result.affectedRows === 1) inserted += 1;
    else if (result.affectedRows === 2) updated += 1;
  }
  console.log(`Seeded products: inserted=${inserted}, updated=${updated}, total=${products.length}`);
} finally {
  await closePool();
}
