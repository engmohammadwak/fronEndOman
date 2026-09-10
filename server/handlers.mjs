import './env.mjs';
import { readStore, updateStore } from './db.mjs';
import { json, verifyPaymobHmac } from './paymob.mjs';
import { adminSession, checkAdminCredentials, createAdminSession, destroyAdminSession, sessionCookie, limitLoginAttempts } from './admin-auth.mjs';
import { mysqlConfigured } from './mysql.mjs';
import {
  listProducts,
  getProductById,
  findByBarcodeOrSku,
  upsertProduct,
  listMovements,
  checkoutSale,
  receiveStock
} from './inventory.mjs';
import { broadcast, broadcastStockUpdate } from './ws-hub.mjs';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from './categories.mjs';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => { size += chunk.length; if (size > 1024 * 1024) { reject(Object.assign(new Error('Request too large'), {status:413})); return; } chunks.push(chunk); });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), {status:400}));
      }
    });
    req.on('error', reject);
  });
}

function requireAdmin(req, res) {
  if (adminSession(req)) return true;
  json(res, 401, { error: 'Admin authentication required' });
  return false;
}

function requireMysql(res) {
  if (mysqlConfigured()) return true;
  json(res, 503, { error: 'MySQL inventory is not configured' });
  return false;
}

function maskPaymob(paymob) {
  return {
    enabled: !!paymob.enabled,
    baseUrl: paymob.baseUrl,
    currency: paymob.currency,
    amountMultiplier: paymob.amountMultiplier,
    mode: paymob.mode,
    integrationId: paymob.integrationId,
    iframeId: paymob.iframeId,
    publicKey: paymob.publicKey || '',
    hasSecretKey: Boolean(paymob.secretKey),
    hasPublicKey: Boolean(paymob.publicKey),
    hasHmac: Boolean(paymob.hmacSecret),
    hasApiKey: Boolean(paymob.apiKey)
  };
}

function broadcastStock(result) {
  broadcastStockUpdate(
    (result.items || []).map((item) => ({
      id: item.id,
      remainingStock: item.remainingStock,
      sku: item.sku,
      barcode: item.barcode
    })),
    result.channel || 'POS'
  );
}

export async function handleApi(req, res, url) {
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/payments/config') {
    const paymob = readStore().paymob;
    json(res, 200, {
      enabled: false, // Server-authoritative catalog/checkout integration is required.
      provider: 'paymob',
      currency: paymob.currency || 'OMR',
      inventory: mysqlConfigured() ? 'mysql' : 'local'
    });
    return true;
  }

  if (req.method === 'GET' && path === '/api/products') {
    const activeOnly = url.searchParams.get('all') !== '1';
    if (mysqlConfigured()) {
      try {
        const products = await listProducts({ activeOnly });
        json(res, 200, { ok: true, products, source: 'mysql' });
        return true;
      } catch (error) {
        console.error('[products] MySQL list failed:', error.message);
      }
    }
    const local = Array.isArray(readStore().products) ? readStore().products : [];
    const products = activeOnly ? local.filter((item) => item.active !== false) : local;
    json(res, 200, { ok: true, products, source: 'local' });
    return true;
  }

  if (req.method === 'GET' && path.startsWith('/api/products/')) {
    const id = path.slice('/api/products/'.length);
    if (!/^\d+$/.test(id)) {
      json(res, 404, { error: 'Product not found' });
      return true;
    }
    if (mysqlConfigured()) {
      try {
        const product = await getProductById(Number(id));
        if (product) {
          json(res, 200, { ok: true, product, source: 'mysql' });
          return true;
        }
      } catch (error) {
        console.error('[products] MySQL get failed:', error.message);
      }
    }
    const product = (readStore().products || []).find((item) => Number(item.id) === Number(id));
    if (!product) {
      json(res, 404, { error: 'Product not found' });
      return true;
    }
    json(res, 200, { ok: true, product, source: 'local' });
    return true;
  }

  if (req.method === 'POST' && path === '/api/products') {
    if (!requireAdmin(req, res) || !requireMysql(res)) return true;
    const body = await readBody(req);
    const product = await upsertProduct(body);
    broadcastStockUpdate([{ id: product.id, remainingStock: product.stock, sku: product.sku, barcode: product.barcode }], 'ADMIN');
    json(res, 200, { ok: true, product });
    return true;
  }

  if (req.method === 'PUT' && path.startsWith('/api/products/')) {
    if (!requireAdmin(req, res) || !requireMysql(res)) return true;
    const id = path.slice('/api/products/'.length);
    if (!/^\d+$/.test(id)) {
      json(res, 404, { error: 'Product not found' });
      return true;
    }
    const body = await readBody(req);
    const product = await upsertProduct({ ...body, id: Number(id) });
    broadcastStockUpdate([{ id: product.id, remainingStock: product.stock, sku: product.sku, barcode: product.barcode }], 'ADMIN');
    json(res, 200, { ok: true, product });
    return true;
  }

  if (req.method === 'GET' && path.startsWith('/api/pos/scan/')) {
    if (!requireAdmin(req, res) || !requireMysql(res)) return true;
    const code = decodeURIComponent(path.slice('/api/pos/scan/'.length));
    const product = await findByBarcodeOrSku(code);
    if (!product) {
      json(res, 404, { ok: false, message: 'الصنف غير معرف في النظام' });
      return true;
    }
    json(res, 200, { ok: true, product });
    return true;
  }

  if (req.method === 'POST' && path === '/api/pos/checkout') {
    if (!requireAdmin(req, res) || !requireMysql(res)) return true;
    const body = await readBody(req);
    const session = adminSession(req);
    const result = await checkoutSale({
      channel: 'POS',
      items: body.items,
      paymentMethod: body.paymentMethod || 'CASH',
      cashierEmail: session?.email,
      customerName: body.customerName
    });
    broadcastStock(result);
    json(res, 200, { ...result, success: true });
    return true;
  }

  if (req.method === 'POST' && (path === '/api/inventory/receive' || path === '/api/inventory/restock')) {
    if (!requireAdmin(req, res) || !requireMysql(res)) return true;
    const body = await readBody(req);
    const result = await receiveStock({
      productId: body.productId,
      barcode: body.barcode,
      sku: body.sku,
      qty: body.qty ?? body.quantity,
      unitCost: body.unitCost ?? body.costPrice,
      notes: body.notes || body.referenceDoc || ''
    });
    broadcastStockUpdate(
      [{ id: result.product.id, remainingStock: result.remainingStock, sku: result.product.sku, barcode: result.product.barcode }],
      'PURCHASE'
    );
    json(res, 200, { ok: true, ...result, success: true, newStock: result.remainingStock });
    return true;
  }

  if (req.method === 'GET' && path === '/api/inventory/movements') {
    if (!requireAdmin(req, res) || !requireMysql(res)) return true;
    const movements = await listMovements(url.searchParams.get('limit'));
    json(res, 200, { ok: true, movements });
    return true;
  }

  if (req.method === 'GET' && path === '/api/categories') {
    const activeOnly = url.searchParams.get('all') !== '1';
    const categories = await listCategories({ activeOnly });
    json(res, 200, { ok: true, categories });
    return true;
  }

  if (req.method === 'POST' && path === '/api/admin/categories') {
    if (!requireAdmin(req, res)) return true;
    const body = await readBody(req);
    const category = await createCategory(body);
    json(res, 200, { ok: true, category });
    return true;
  }

  if (req.method === 'PUT' && path.startsWith('/api/admin/categories/')) {
    if (!requireAdmin(req, res)) return true;
    const id = path.slice('/api/admin/categories/'.length);
    if (!/^\d+$/.test(id)) {
      json(res, 404, { error: 'Category not found' });
      return true;
    }
    const body = await readBody(req);
    const category = await updateCategory(Number(id), body);
    json(res, 200, { ok: true, category });
    return true;
  }

  if (req.method === 'DELETE' && path.startsWith('/api/admin/categories/')) {
    if (!requireAdmin(req, res)) return true;
    const id = path.slice('/api/admin/categories/'.length);
    if (!/^\d+$/.test(id)) {
      json(res, 404, { error: 'Category not found' });
      return true;
    }
    const force = url.searchParams.get('force') === '1';
    const result = await deleteCategory(Number(id), { force });
    json(res, 200, result);
    return true;
  }

  if (req.method === 'GET' && path === '/api/admin/session') {
    const session = adminSession(req);
    // Always HTTP 200 so the login page probe is not a red 401 in DevTools.
    json(res, 200, session ? { ok: true, email: session.email } : { ok: false });
    return true;
  }

  if (req.method === 'POST' && path === '/api/admin/login') {
    limitLoginAttempts(req.ip || req.socket?.remoteAddress || 'unknown');
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!await checkAdminCredentials(email, password)) { json(res, 401, { error: 'Invalid credentials' }); return true; }
    const token = createAdminSession(email);
    res.setHeader('Set-Cookie', sessionCookie(token, undefined, { req }));
    json(res, 200, { ok: true, email });
    return true;
  }

  if (req.method === 'POST' && path === '/api/admin/logout') {
    destroyAdminSession(req);
    res.setHeader('Set-Cookie', sessionCookie('', 0, { req }));
    json(res, 200, { ok: true });
    return true;
  }

  if (req.method === 'GET' && path === '/api/admin/paymob') {
    if (!requireAdmin(req, res)) return true;
    json(res, 200, maskPaymob(readStore().paymob));
    return true;
  }

  if (req.method === 'PUT' && path === '/api/admin/paymob') {
    if (!requireAdmin(req, res)) return true;
    const body = await readBody(req);
    if (body.baseUrl && !['https://oman.paymob.com','https://accept.paymob.com','https://uae.paymob.com','https://ksa.paymob.com'].includes(String(body.baseUrl).replace(/\/+$/, ''))) {
      json(res,400,{error:'Unsupported payment provider URL'});return true;
    }
    if (body.currency && body.currency !== 'OMR') {json(res,400,{error:'This store uses OMR'});return true;}
    if (body.amountMultiplier != null && Number(body.amountMultiplier) !== 1000) {json(res,400,{error:'OMR requires 1000 baisa per rial'});return true;}
    const saved = updateStore((store) => {
      const current = store.paymob;
      store.paymob = {
        ...current,
        enabled: body.enabled === true || body.enabled === '1' || body.enabled === 'true',
        baseUrl: String(body.baseUrl || current.baseUrl || 'https://oman.paymob.com').replace(/\/+$/, ''),
        currency: String(body.currency || current.currency || 'OMR').toUpperCase(),
        amountMultiplier: Number(body.amountMultiplier || current.amountMultiplier || 1000),
        mode: body.mode === 'iframe' ? 'iframe' : 'intention',
        integrationId: String(body.integrationId ?? current.integrationId ?? ''),
        iframeId: String(body.iframeId ?? current.iframeId ?? ''),
        secretKey: body.secretKey ? String(body.secretKey) : current.secretKey,
        publicKey: body.publicKey ? String(body.publicKey) : current.publicKey,
        hmacSecret: body.hmacSecret ? String(body.hmacSecret) : current.hmacSecret,
        apiKey: body.apiKey ? String(body.apiKey) : current.apiKey
      };
      return store;
    });
    json(res, 200, maskPaymob(saved.paymob));
    return true;
  }

  if (req.method === 'GET' && path === '/api/admin/orders') {
    if (!requireAdmin(req, res)) return true;
    json(res, 200, { orders: readStore().orders });
    return true;
  }

  if (req.method === 'POST' && ['/api/orders', '/api/checkout/pay'].includes(path)) {
    json(res, 503, { error:'Live checkout requires authoritative server catalog pricing and inventory validation.' }); return true;
  }

  if (req.method === 'GET' && path.startsWith('/api/orders/')) {
    if (!requireAdmin(req, res)) return true;
    const orderId = decodeURIComponent(path.slice('/api/orders/'.length));
    const order = readStore().orders.find((item) => item.orderId === orderId);
    if (!order) {
      json(res, 404, { error: 'Order not found' });
      return true;
    }
    json(res, 200, { order });
    return true;
  }

  if (req.method === 'POST' && path === '/api/paymob/webhook') {
    const body = await readBody(req);
    const obj = body.obj || body;
    const hmac = url.searchParams.get('hmac') || body.hmac || '';
    const paymob = readStore().paymob;
    if (!verifyPaymobHmac(obj, hmac, paymob.hmacSecret)) {
      json(res, 401, { error: 'Invalid HMAC' });
      return true;
    }
    const success = obj.success === true || obj.success === 'true';
    const pending = obj.pending === true || obj.pending === 'true';
    updateStore((store) => {
      // Match only fields covered by HMAC, never unsigned merchant metadata.
      const order = store.orders.find(item => item.providerRef != null && String(item.providerRef) === String(obj.order?.id));
      if (!order || order.paymentStatus === 'paid') return store;
      if (obj.currency !== 'OMR' || Number(obj.amount_cents) !== Math.round(Number(order.total) * 1000)) return store;
      if (store.processedEvents?.includes(String(obj.id))) return store;
      store.processedEvents = [...(store.processedEvents || []), String(obj.id)].slice(-500);
      if (success && !pending) {
        order.status = 'received';
        order.paymentStatus = 'paid';
        order.paidAt = new Date().toISOString();
        order.transactionId = String(obj.id);
      } else if (!success && !pending) {
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
      }
      return store;
    });
    json(res, 200, { received: true });
    return true;
  }

  return false;
}
