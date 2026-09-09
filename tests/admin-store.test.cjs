const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

test('live inventory deducts stock and blocks oversell', () => {
  const saved = {};
  const context = vm.createContext({
    window: {},
    document: { dispatchEvent() {}, addEventListener() {}, documentElement: { lang: 'ar' } },
    localStorage: {
      getItem(key) { return saved[key] ?? null; },
      setItem(key, value) { saved[key] = value; }
    },
    STOREFRONT_DEMO_PRODUCTS: [{ id: 1, nameAr: 'iPhone', nameEn: 'iPhone', price: 100, stock: 5, listingType: 'new' }]
  });
  vm.runInContext(fs.readFileSync('js/admin/store-state.js', 'utf8'), context);
  const StoreState = context.window.StoreState;
  assert.equal(StoreState.availableStock(1), 5);
  assert.equal(StoreState.deductStock(1, 2), true);
  assert.equal(StoreState.availableStock(1), 3);
  assert.equal(StoreState.canSell(1, 10), false);
  assert.equal(StoreState.deductStock(1, 10), false);
  assert.equal(StoreState.availableStock(1), 3);
});
