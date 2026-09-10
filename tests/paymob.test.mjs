import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { centsFromAmount, verifyPaymobHmac, HMAC_FIELDS } from '../server/paymob.mjs';

function signed(obj, secret) {
  const payload = HMAC_FIELDS.map((field) => String(field.split('.').reduce((value, key) => (value == null ? value : value[key]), obj) ?? '')).join('');
  return crypto.createHmac('sha512', secret).update(payload).digest('hex');
}

test('OMR amounts convert with a 1000 baisa multiplier', () => {
  assert.equal(centsFromAmount(12.5, 1000), 12500);
  assert.equal(centsFromAmount(1, 100), 100);
});

test('Paymob webhook HMAC matches the documented field order', () => {
  const obj = {
    amount_cents: 12500,
    created_at: '2026-01-01T00:00:00',
    currency: 'OMR',
    error_occured: false,
    has_parent_transaction: false,
    id: 99,
    integration_id: 1,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    order: { id: 55 },
    owner: 8,
    pending: false,
    source_data: { pan: '2346', sub_type: 'MasterCard', type: 'card' },
    success: true
  };
  const hmac = signed(obj, 'test-hmac');
  assert.equal(verifyPaymobHmac(obj, hmac, 'test-hmac'), true);
  assert.equal(verifyPaymobHmac(obj, hmac, 'wrong'), false);
  assert.equal(verifyPaymobHmac({ ...obj, success: false }, hmac, 'test-hmac'), false);
});
