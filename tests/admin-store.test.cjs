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

test('preview orders aggregate variants, commit once, restore once, and keep a deleted catalog empty',()=>{
  const saved={};
  const context=vm.createContext({window:{},document:{dispatchEvent(){}},
    localStorage:{getItem:key=>saved[key]??null,setItem:(key,value)=>{saved[key]=value;},removeItem:key=>{delete saved[key];}},
    STOREFRONT_DEMO_PRODUCTS:[{id:1,price:100,stock:5}]
  });
  vm.runInContext(fs.readFileSync('js/admin/store-state.js','utf8'),context);
  const store=context.window.StoreState;
  assert.equal(store.deductStock(1,0),false);
  assert.equal(store.deductCart([{productId:1,qty:3},{productId:1,qty:3}]).ok,false);
  assert.equal(store.availableStock(1),5);
  const order={orderId:'preview-1',items:[{productId:1,qty:2}],total:200};
  store.commitPreviewOrder(order);store.commitPreviewOrder(order);
  assert.equal(store.availableStock(1),3);
  store.updateOrderStatus(order.orderId,'cancelled');store.updateOrderStatus(order.orderId,'cancelled');
  assert.equal(store.availableStock(1),5);
  assert.throws(()=>store.updateOrderStatus(order.orderId,'processing'),/cannot be reopened/);
  store.deleteProduct(1);store.ensure();
  assert.equal(store.getProducts().length,0);
});
