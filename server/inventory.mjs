import { withConnection, withTransaction, mysqlConfigured } from './mysql.mjs';

function money(value) {
  return Number(Number(value || 0).toFixed(3));
}

export function mapProductRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    sku: row.sku,
    barcode: row.barcode,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    brand: row.brand,
    category: row.category,
    listingType: row.listing_type,
    extraAr: row.description_ar,
    extraEn: row.description_en,
    image: row.image,
    costPrice: money(row.cost_price),
    price: money(row.selling_price),
    oldPrice: row.old_price == null ? '' : money(row.old_price),
    taxRate: Number(row.tax_rate || 0),
    stock: Number(row.stock_quantity || 0),
    minStock: Number(row.min_stock_alert || 5),
    active: row.is_active !== 0 && row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listProducts({ activeOnly = true } = {}) {
  return withConnection(async (connection) => {
    const [rows] = await connection.query(
      activeOnly
        ? 'SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC'
        : 'SELECT * FROM products ORDER BY id DESC'
    );
    return rows.map(mapProductRow);
  });
}

export async function getProductById(id) {
  return withConnection(async (connection) => {
    const [rows] = await connection.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    return mapProductRow(rows[0]);
  });
}

export async function findByBarcodeOrSku(code) {
  const value = String(code || '').trim();
  if (!value) return null;
  return withConnection(async (connection) => {
    const [rows] = await connection.query(
      'SELECT * FROM products WHERE (barcode = ? OR sku = ?) AND is_active = 1 LIMIT 1',
      [value, value]
    );
    return mapProductRow(rows[0]);
  });
}

export async function upsertProduct(input) {
  const sku = String(input.sku || '').trim();
  const barcode = String(input.barcode || sku).trim();
  if (!sku || !barcode || !String(input.nameAr || input.nameEn || '').trim()) {
    throw Object.assign(new Error('sku, barcode, and name are required'), { status: 400 });
  }
  return withConnection(async (connection) => {
    if (input.id) {
      await connection.query(
        `UPDATE products SET
          sku = ?, barcode = ?, name_ar = ?, name_en = ?, brand = ?, category = ?, listing_type = ?,
          description_ar = ?, description_en = ?, image = ?, cost_price = ?, selling_price = ?, old_price = ?,
          tax_rate = ?, stock_quantity = ?, min_stock_alert = ?, is_active = ?
         WHERE id = ?`,
        [
          sku,
          barcode,
          input.nameAr || input.nameEn,
          input.nameEn || null,
          input.brand || null,
          input.category || null,
          input.listingType || 'new',
          input.extraAr || null,
          input.extraEn || null,
          input.image || null,
          money(input.costPrice ?? input.cost_price ?? 0),
          money(input.price ?? input.selling_price ?? 0),
          input.oldPrice === '' || input.oldPrice == null ? null : money(input.oldPrice),
          Number(input.taxRate ?? 5),
          Math.max(0, Number(input.stock ?? 0)),
          Math.max(0, Number(input.minStock ?? 5)),
          input.active === false || input.active === 0 || input.active === '0' ? 0 : 1,
          input.id
        ]
      );
      const [rows] = await connection.query('SELECT * FROM products WHERE id = ?', [input.id]);
      return mapProductRow(rows[0]);
    }

    const [result] = await connection.query(
      `INSERT INTO products (
        sku, barcode, name_ar, name_en, brand, category, listing_type,
        description_ar, description_en, image, cost_price, selling_price, old_price,
        tax_rate, stock_quantity, min_stock_alert, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sku,
        barcode,
        input.nameAr || input.nameEn,
        input.nameEn || null,
        input.brand || null,
        input.category || null,
        input.listingType || 'new',
        input.extraAr || null,
        input.extraEn || null,
        input.image || null,
        money(input.costPrice ?? 0),
        money(input.price ?? 0),
        input.oldPrice === '' || input.oldPrice == null ? null : money(input.oldPrice),
        Number(input.taxRate ?? 5),
        Math.max(0, Number(input.stock ?? 0)),
        Math.max(0, Number(input.minStock ?? 5)),
        input.active === false || input.active === 0 || input.active === '0' ? 0 : 1
      ]
    );
    const [rows] = await connection.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    return mapProductRow(rows[0]);
  });
}

export async function listMovements(limit = 50) {
  return withConnection(async (connection) => {
    const [rows] = await connection.query(
      `SELECT m.*, p.sku, p.barcode, p.name_ar, p.name_en
       FROM inventory_movements m
       JOIN products p ON p.id = m.product_id
       ORDER BY m.id DESC
       LIMIT ?`,
      [Math.min(200, Math.max(1, Number(limit) || 50))]
    );
    return rows.map((row) => ({
      id: Number(row.id),
      productId: Number(row.product_id),
      sku: row.sku,
      barcode: row.barcode,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      changeQty: Number(row.change_qty),
      balanceAfter: Number(row.balance_after),
      reason: row.reason,
      referenceId: row.reference_id == null ? null : Number(row.reference_id),
      notes: row.notes,
      createdAt: row.created_at
    }));
  });
}

/**
 * Authoritative checkout: stock locked from DB.
 * items: [{ id, quantity, unitPrice? }] — unitPrice override allowed on POS only (discounts).
 */
export async function checkoutSale({ channel, items, paymentMethod, cashierEmail, customerName } = {}) {
  if (!mysqlConfigured()) throw Object.assign(new Error('MySQL is not configured'), { status: 503 });
  const saleChannel = channel === 'ONLINE' ? 'ONLINE' : 'POS';
  const method = String(paymentMethod || 'CASH').toUpperCase();
  const lines = Array.isArray(items) ? items : [];
  if (!lines.length) throw Object.assign(new Error('Cart is empty'), { status: 400 });

  const merged = new Map();
  for (const line of lines) {
    const id = Number(line.id);
    const quantity = Number(line.quantity);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      throw Object.assign(new Error('Invalid cart line'), { status: 400 });
    }
    let unitPriceOverride = null;
    if (saleChannel === 'POS' && line.unitPrice != null && line.unitPrice !== '') {
      unitPriceOverride = money(line.unitPrice);
      if (!Number.isFinite(unitPriceOverride) || unitPriceOverride < 0) {
        throw Object.assign(new Error('Invalid unit price'), { status: 400 });
      }
    }
    const prev = merged.get(id);
    if (prev) {
      prev.quantity += quantity;
      if (unitPriceOverride != null) prev.unitPriceOverride = unitPriceOverride;
    } else {
      merged.set(id, { quantity, unitPriceOverride });
    }
  }

  return withTransaction(async (connection) => {
    let subtotal = 0;
    let taxAmount = 0;
    const validated = [];

    for (const [productId, entry] of merged.entries()) {
      const quantity = entry.quantity;
      const [rows] = await connection.query(
        'SELECT * FROM products WHERE id = ? FOR UPDATE',
        [productId]
      );
      const prod = rows[0];
      if (!prod || !prod.is_active) {
        throw Object.assign(new Error(`Product ${productId} is unavailable`), { status: 400 });
      }
      if (Number(prod.stock_quantity) < quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for ${prod.name_ar} (remaining: ${prod.stock_quantity})`),
          { status: 409 }
        );
      }

      const listPrice = money(prod.selling_price);
      const unitPrice = entry.unitPriceOverride != null ? entry.unitPriceOverride : listPrice;
      const unitCost = money(prod.cost_price);
      const lineSubtotal = money(unitPrice * quantity);
      const lineTax = money(lineSubtotal * (Number(prod.tax_rate || 0) / 100));
      const lineTotal = money(lineSubtotal + lineTax);
      const newStock = Number(prod.stock_quantity) - quantity;

      await connection.query(
        'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStock, productId]
      );

      subtotal = money(subtotal + lineSubtotal);
      taxAmount = money(taxAmount + lineTax);
      validated.push({
        id: productId,
        nameAr: prod.name_ar,
        nameEn: prod.name_en,
        sku: prod.sku,
        barcode: prod.barcode,
        quantity,
        listPrice,
        unitPrice,
        unitCost,
        subtotal: lineSubtotal,
        taxAmount: lineTax,
        totalAmount: lineTotal,
        remainingStock: newStock
      });
    }

    const totalAmount = money(subtotal + taxAmount);
    const invoiceNumber = `INV-${saleChannel}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const [saleResult] = await connection.query(
      `INSERT INTO sales (
        invoice_number, channel, customer_name, subtotal, tax_amount, total_amount, payment_method, cashier_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        saleChannel,
        customerName || 'زبون نقدي',
        subtotal,
        taxAmount,
        totalAmount,
        method,
        cashierEmail || null
      ]
    );
    const saleId = saleResult.insertId;
    const reason = saleChannel === 'POS' ? 'SALE_POS' : 'SALE_ONLINE';

    for (const item of validated) {
      await connection.query(
        `INSERT INTO sale_items (
          sale_id, product_id, quantity, unit_price, unit_cost, subtotal, tax_amount, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.id,
          item.quantity,
          item.unitPrice,
          item.unitCost,
          item.subtotal,
          item.taxAmount,
          item.totalAmount
        ]
      );
      await connection.query(
        `INSERT INTO inventory_movements (product_id, change_qty, balance_after, reason, reference_id)
         VALUES (?, ?, ?, ?, ?)`,
        [item.id, -item.quantity, item.remainingStock, reason, saleId]
      );
    }

    return {
      ok: true,
      saleId,
      invoiceNumber,
      channel: saleChannel,
      paymentMethod: method,
      subtotal,
      taxAmount,
      totalAmount,
      items: validated
    };
  });
}

export async function receiveStock({ productId, barcode, sku, qty, unitCost, notes } = {}) {
  const quantity = Number(qty);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw Object.assign(new Error('qty must be a positive integer'), { status: 400 });
  }

  return withTransaction(async (connection) => {
    let rows;
    if (productId) {
      [rows] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
    } else {
      const code = String(barcode || sku || '').trim();
      if (!code) throw Object.assign(new Error('productId or barcode/sku required'), { status: 400 });
      [rows] = await connection.query(
        'SELECT * FROM products WHERE barcode = ? OR sku = ? FOR UPDATE',
        [code, code]
      );
    }
    const prod = rows[0];
    if (!prod) throw Object.assign(new Error('Product not found'), { status: 404 });

    const newStock = Number(prod.stock_quantity) + quantity;
    const nextCost = unitCost == null || unitCost === '' ? prod.cost_price : money(unitCost);
    await connection.query(
      'UPDATE products SET stock_quantity = ?, cost_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStock, nextCost, prod.id]
    );
    const [move] = await connection.query(
      `INSERT INTO inventory_movements (product_id, change_qty, balance_after, reason, notes)
       VALUES (?, ?, ?, 'PURCHASE_RESTOCK', ?)`,
      [prod.id, quantity, newStock, notes || null]
    );

    return {
      ok: true,
      product: mapProductRow({ ...prod, stock_quantity: newStock, cost_price: nextCost }),
      movementId: move.insertId,
      remainingStock: newStock
    };
  });
}
