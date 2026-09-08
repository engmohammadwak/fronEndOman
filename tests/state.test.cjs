const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup(saved = {}, blocked = false) {
  const elements = {};
  const context = vm.createContext({
    URL, console,
    localStorage: {
      getItem(key) { if (blocked) throw Error('blocked'); return saved[key] ?? null; },
      setItem(key, value) { if (blocked) throw Error('blocked'); saved[key] = value; }
    },
    document: {
      currentScript: { src: 'https://example.com/shop/js/main.js' },
      addEventListener() {},
      getElementById(id) { return elements[id] || null; },
      querySelector() { return null; }, querySelectorAll() { return []; },
      documentElement: { setAttribute() {} }
    },
    window: { location: { pathname: '/shop/', href: 'https://example.com/shop/' } }
  });
  for (const file of ['js/main.js', 'js/i18n.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  return { context, saved, elements, run: code => vm.runInContext(code, context) };
}
test('cart persists without header and rejects invalid prices', () => {
  const { run, saved } = setup();
  run('addToCart(12.5); addToCart("9"); addToCart(-1); addToCart(NaN)');
  assert.deepEqual(JSON.parse(saved.cart), [{ price: 12.5 }]);
  run('clearCart()');
  assert.deepEqual(JSON.parse(saved.cart), []);
});
test('malformed saved cart and unsupported language recover safely', () => {
  for (const cart of ['null', '{}', 'broken', '[null,{"price":"5"}]']) {
    const { run } = setup({ cart, lang: 'fr' });
    run('loadSavedLanguage(); addToCart(3)');
    assert.equal(run('cart.length'), 1);
    assert.equal(run('currentLang'), 'ar');
  }
});
test('language toggle preserves cart count and translates total', () => {
  const { run, elements } = setup({ cart: '[{"price":12.5}]' });
  elements['cart-count'] = {};
  elements['cart-total'] = {};
  run('toggleLanguage()');
  assert.equal(elements['cart-count'].textContent, 'Shopping Cart (1)');
  assert.equal(elements['cart-total'].textContent, '12.50 OMR');
});
test('blocked localStorage does not prevent initialization or cart changes', () => {
  const { run } = setup({}, true);
  assert.doesNotThrow(() => run('loadSavedLanguage(); toggleLanguage(); addToCart(2)'));
});
test('component paths resolve from application root on nested hosting', () => {
  const { run } = setup();
  assert.equal(run("new URL('components/header.html', appBaseUrl).href"), 'https://example.com/shop/components/header.html');
});
