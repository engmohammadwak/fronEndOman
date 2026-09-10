import crypto from 'node:crypto';

const HMAC_FIELDS = [
  'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
  'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
  'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending',
  'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success'
];

function pick(obj, path) {
  return path.split('.').reduce((value, key) => (value == null ? value : value[key]), obj);
}

export function centsFromAmount(amount, multiplier) {
  const factor = Number(multiplier) > 0 ? Number(multiplier) : 1000;
  return Math.round(Number(amount || 0) * factor);
}

export function verifyPaymobHmac(obj, receivedHmac, secret) {
  if (!obj || !secret || !receivedHmac) return false;
  const payload = HMAC_FIELDS.map((field) => String(pick(obj, field) ?? '')).join('');
  const computed = crypto.createHmac('sha512', String(secret)).update(payload).digest('hex');
  const left = Buffer.from(computed, 'utf8');
  const right = Buffer.from(String(receivedHmac), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function json(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(raw);
}

async function paymobFetch(baseUrl, pathname, { method = 'POST', headers = {}, body } = {}) {
  const url = `${String(baseUrl).replace(/\/+$/, '')}${pathname}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    redirect: 'error',
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body == null ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) {
    const message = data.message || data.detail || data.error || `Paymob error ${response.status}`;
    const error = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function splitName(fullName) {
  const parts = String(fullName || 'Customer').trim().split(/\s+/);
  return { first: parts[0] || 'Customer', last: parts.slice(1).join(' ') || 'Store' };
}

function billingData(order, country) {
  const { first, last } = splitName(order.customerName);
  return {
    first_name: first,
    last_name: last,
    email: order.email || 'order@smartearth.om',
    phone_number: String(order.phone || '').replace(/\D/g, '') || '96890000000',
    apartment: 'NA',
    floor: 'NA',
    street: order.address || 'NA',
    building: 'NA',
    shipping_method: 'NA',
    postal_code: 'NA',
    city: 'Muscat',
    state: 'Muscat',
    country: country || 'OMN'
  };
}

export async function createPaymobCheckout(order, paymob, publicUrl) {
  if (!paymob?.enabled) {
    const error = new Error('Paymob is not configured');
    error.code = 'PAYMOB_NOT_CONFIGURED';
    throw error;
  }
  const amount = centsFromAmount(order.total, paymob.amountMultiplier);
  const items = (order.items || []).map((item) => ({
    name: String(item.nameAr || item.nameEn || 'Item').slice(0, 120),
    amount: centsFromAmount(item.price, paymob.amountMultiplier),
    quantity: Number(item.qty || 1),
    description: String(item.sku || item.productId || 'item')
  }));
  const notify = `${publicUrl}/api/paymob/webhook`;
  const redirect = `${publicUrl}/payment/return?order_id=${encodeURIComponent(order.orderId)}`;

  if (paymob.mode === 'iframe') {
    if (!paymob.apiKey || !paymob.iframeId || !paymob.integrationId) {
      const error = new Error('Iframe checkout needs API key, integration ID, and iframe ID');
      error.code = 'PAYMOB_INCOMPLETE';
      throw error;
    }
    const auth = await paymobFetch(paymob.baseUrl, '/api/auth/tokens', {
      body: { api_key: paymob.apiKey }
    });
    const token = auth.token || auth.auth_token;
    if (!token) throw new Error('Paymob did not return an auth token');
    const registered = await paymobFetch(paymob.baseUrl, '/api/ecommerce/orders', {
      body: {
        auth_token: token,
        delivery_needed: false,
        amount_cents: String(amount),
        currency: paymob.currency || 'OMR',
        merchant_order_id: order.orderId,
        items
      }
    });
    const keyed = await paymobFetch(paymob.baseUrl, '/api/acceptance/payment_keys', {
      body: {
        auth_token: token,
        amount_cents: amount,
        expiration: 3600,
        order_id: registered.id,
        billing_data: billingData(order),
        currency: paymob.currency || 'OMR',
        integration_id: Number(paymob.integrationId),
        redirection_url: redirect
      }
    });
    const paymentKey = keyed.token;
    if (!paymentKey) throw new Error('Paymob did not return a payment key');
    return {
      checkoutUrl: `${String(paymob.baseUrl).replace(/\/+$/, '')}/api/acceptance/iframes/${paymob.iframeId}?payment_token=${encodeURIComponent(paymentKey)}`,
      providerRef: String(registered.id),
      mode: 'iframe'
    };
  }

  if (!paymob.secretKey || !paymob.publicKey || !paymob.integrationId) {
    const error = new Error('Unified checkout needs secret key, public key, and integration ID');
    error.code = 'PAYMOB_INCOMPLETE';
    throw error;
  }
  const intention = await paymobFetch(paymob.baseUrl, '/v1/intention/', {
    headers: { Authorization: `Token ${paymob.secretKey}` },
    body: {
      amount,
      currency: paymob.currency || 'OMR',
      payment_methods: [Number(paymob.integrationId)],
      items,
      special_reference: order.orderId,
      billing_data: billingData(order),
      customer: {
        first_name: billingData(order).first_name,
        last_name: billingData(order).last_name,
        email: billingData(order).email
      },
      notification_url: notify,
      redirection_url: redirect
    }
  });
  const clientSecret = intention.client_secret;
  if (!clientSecret) throw new Error('Paymob did not return a client secret');
  return {
    checkoutUrl: `${String(paymob.baseUrl).replace(/\/+$/, '')}/unifiedcheckout/?publicKey=${encodeURIComponent(paymob.publicKey)}&clientSecret=${encodeURIComponent(clientSecret)}`,
    providerRef: String(intention.intention_order_id || intention.id || ''),
    mode: 'intention'
  };
}

export { json, HMAC_FIELDS };
