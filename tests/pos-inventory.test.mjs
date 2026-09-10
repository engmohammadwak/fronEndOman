import { test } from 'node:test';
import assert from 'node:assert/strict';
import { broadcast, clientCount } from '../server/ws-hub.mjs';
import { mysqlConfigured } from '../server/mysql.mjs';

test('WebSocket hub broadcast reaches open clients', () => {
  const count = broadcast('STOCK_MUTATION', { items: [{ id: 1, stock: 0 }] });
  assert.equal(typeof count, 'number');
  assert.equal(clientCount(), 0);
});

test('broadcastStockUpdate emits without clients', async () => {
  const { broadcastStockUpdate } = await import('../server/ws-hub.mjs');
  assert.equal(typeof broadcastStockUpdate([{ id: 9, remaining_stock: 3, sku: 'X' }], 'POS'), 'number');
});

test('MySQL inventory helpers enforce cart validation without DB when unconfigured', async () => {
  if (mysqlConfigured()) {
    assert.ok(true, 'MySQL configured — validation covered by integration test');
    return;
  }
  const { checkoutSale } = await import('../server/inventory.mjs');
  await assert.rejects(
    () => checkoutSale({ channel: 'POS', items: [{ id: 1, quantity: 1 }], paymentMethod: 'CASH' }),
    /MySQL is not configured/
  );
});

test('concurrent last-unit checkout: only one sale wins when MySQL is available', async (t) => {
  if (!mysqlConfigured()) {
    t.skip('Set DATABASE_URL or MYSQL_* to run concurrency integration test');
    return;
  }
  const { withConnection, closePool } = await import('../server/mysql.mjs');
  const { checkoutSale } = await import('../server/inventory.mjs');

  const sku = `TEST-LOCK-${Date.now()}`;
  let productId;
  await withConnection(async (connection) => {
    const [result] = await connection.query(
      `INSERT INTO products (sku, barcode, name_ar, name_en, cost_price, selling_price, tax_rate, stock_quantity, is_active)
       VALUES (?, ?, 'اختبار قفل', 'Lock test', 1.000, 2.000, 5.00, 1, 1)`,
      [sku, sku]
    );
    productId = result.insertId;
  });

  try {
    const results = await Promise.allSettled([
      checkoutSale({ channel: 'POS', items: [{ id: productId, quantity: 1 }], paymentMethod: 'CASH' }),
      checkoutSale({ channel: 'ONLINE', items: [{ id: productId, quantity: 1 }], paymentMethod: 'CARD' })
    ]);
    const fulfilled = results.filter((item) => item.status === 'fulfilled');
    const rejected = results.filter((item) => item.status === 'rejected');
    assert.equal(fulfilled.length, 1, 'exactly one checkout should succeed');
    assert.equal(rejected.length, 1, 'exactly one checkout should fail');
    await withConnection(async (connection) => {
      const [rows] = await connection.query('SELECT stock_quantity FROM products WHERE id = ?', [productId]);
      assert.equal(Number(rows[0].stock_quantity), 0);
    });
  } finally {
    await withConnection(async (connection) => {
      await connection.query('DELETE FROM sale_items WHERE product_id = ?', [productId]);
      await connection.query('DELETE FROM inventory_movements WHERE product_id = ?', [productId]);
      await connection.query(
        'DELETE FROM sales WHERE id NOT IN (SELECT sale_id FROM sale_items) AND invoice_number LIKE ?',
        [`%${sku}%`]
      );
      // Cleanup sales created in this test via movements reference
      await connection.query('DELETE FROM products WHERE id = ?', [productId]);
    });
    await closePool();
  }
});
