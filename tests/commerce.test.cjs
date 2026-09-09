const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
function setup(mode = 'demo', fetchImpl) {
  const saved = {};
  const tabSaved = {};
  const c = vm.createContext({ URL, URLSearchParams, TextEncoder, crypto: webcrypto, AbortController, setTimeout, clearTimeout, console,
    document: { currentScript: { src:'https://example.com/shop/js/api.js' }, readyState:'loading', addEventListener(){}, getElementById(){return null;}, documentElement:{lang:'en'}, cookie:'' },
    window: { TECHPRO_CONFIG:{mode}, addEventListener(){}, location:{href:'https://example.com/shop/',search:''} },
    localStorage: {getItem:k=>saved[k] ?? null, setItem:(k,v)=>saved[k]=v},
    sessionStorage: {getItem:k=>tabSaved[k] ?? null,setItem:(k,v)=>tabSaved[k]=v,removeItem:k=>delete tabSaved[k]},
    fetch: fetchImpl || (()=>{throw Error('unexpected request')}) });
  const load = file => vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
  ['js/api.js','js/main.js','js/auth-state.js','js/pages/storefront-common.js','js/pages/commerce-common.js'].forEach(load);
  return { c, saved, load, run:code=>vm.runInContext(code,c) };
}
test('different colors and variants stay separate; invalid quantities are rejected',()=>{
 const {run}=setup();
 run("addToCart({productId:1,price:10,colorEn:'Black'});addToCart({productId:1,price:10,colorEn:'White'});addToCart({productId:2,price:1,qty:'bad'});addToCart({productId:3,price:1,qty:1.5})");
 assert.equal(run('cart.length'),2);
 assert.equal(run('addToCart({productId:1,price:10,colorEn:"Black",qty:10,stock:2})'),false);
});
test('live failed order sends once and is not saved as demo',async()=>{
 let calls=0;
 const {run,saved}=setup('live',async()=>{calls++;return {ok:false,status:503};});
 await assert.rejects(run("submitOrderToDashboard({orderId:'stable-id',items:[{isDemo:false}]})"));
 assert.equal(calls,1);assert.equal(saved.techpro_orders,undefined);
});
test('demo order is saved without any POST',async()=>{
 const {run,saved}=setup();
 const order=await run("submitOrderToDashboard({orderId:'preview',items:[],total:10})");
 assert.equal(order.isDemo,true);assert.equal(JSON.parse(saved.techpro_orders).length,1);
});
test('confirmed live order is saved to history and carries idempotency key',async()=>{
 let header;
 const {run,saved}=setup('live',async(url,opts)=>{header=opts.headers['Idempotency-Key'];return {ok:true,json:async()=>({order:{orderId:'server-1',total:12}})};});
 await run("submitOrderToDashboard({orderId:'stable-id',items:[{isDemo:false}]})");
 assert.equal(header,'stable-id');assert.equal(JSON.parse(saved.techpro_orders)[0].orderId,'server-1');
});
test('empty API list remains valid',()=>assert.equal(setup().run('apiList({data:[]}).length'),0));
test('real product is not overwritten by demo profile or fabricated capacity',()=>{
 const {run,load}=setup();
 load('js/pages/product-demo-profiles.js');load('js/pages/product.js');
 const result=run("enrichPdpProduct({id:1,isDemo:false,nameEn:'Real product',price:200,storageGb:512,listingType:'new',category:'phones',image:'https://example.com/real.png'},[])");
 assert.equal(result.storageOptions.length,1);assert.equal(result.storageOptions[0].price,200);
 assert.equal(result.gallery[0].src,'https://example.com/real.png');assert.equal(result.reviewsList.length,0);
});
test('unknown order id cannot create success record',()=>{
 const {run,load,c}=setup();c.window.location.search='?order_id=unknown';load('js/pages/success.js');assert.equal(run('readSuccessOrder()'),null);
});
test('demo password record is salted and verifies without recoverable encoding',async()=>{
 const {run}=setup();
 const record=await run("hashPassword('example-password')");
 assert.equal(await run(`verifyDemoPassword('example-password',${JSON.stringify(record)})`),true);
 assert.equal(await run(`verifyDemoPassword('wrong-password',${JSON.stringify(record)})`),false);
 assert.notEqual(await run("hashPassword('example-password')"),record);
});
test('account carts are isolated and guest cart is restored on logout',()=>{
 const {run}=setup();
 run('addToCart({productId:1,price:10});setAuthSession({id:1,name:"A"})');
 assert.equal(run('cart.length'),0);
 run('addToCart({productId:2,price:20});setAuthSession({id:2,name:"B"})');
 assert.equal(run('cart.length'),0);
 run('setAuthSession({id:1,name:"A"})');
 assert.equal(run('cart[0].productId'),2);
 run('clearAuthSession()');assert.equal(run('cart[0].productId'),1);
});
test('opaque product identifiers work in wishlist',()=>{
 const {run}=setup();
 run("addToWishlist('uuid-a');addToWishlist('uuid-b');addToWishlist('uuid-a')");
 assert.equal(run('wishlist.length'),2);assert.equal(run("isInWishlist('uuid-b')"),true);
});
test('failed checkout preserves cart and prevents concurrent submissions',async()=>{
 const {run,load,c}=setup('live');
 const button={disabled:false};
 const fields={ 'cust-name':{value:'Demo Name'}, 'cust-phone':{value:'96891234567'}, 'cust-address':{value:'Demo delivery address'} };
 c.document.getElementById=id=>fields[id] || null;
 load('js/pages/checkout.js');
 c.event={preventDefault(){},target:{querySelector(){return button;}}};
 run("checkoutUi.payment='cod';addToCart({productId:1,price:12,isDemo:false});let attempts=0;submitOrderToDashboard=async()=>{attempts++;await Promise.resolve();throw Error('offline')};notifyCommerce=()=>{};showFieldError=()=>{}");
 await run('Promise.all([handleCheckoutSubmit(event),handleCheckoutSubmit(event)])');
 assert.equal(run('attempts'),1);assert.equal(run('cart.length'),1);assert.equal(button.disabled,false);
});
test('invalid API products are rejected instead of rendering NaN prices',()=>{
 const {run}=setup();
 assert.throws(()=>run("normalizeProduct({id:1,price:'invalid'})"));
 assert.throws(()=>run("normalizeProduct({id:1,price:10,stock:-1})"));
});
test('checkout completion after account switch leaves the new account cart intact',async()=>{
 const {run,load,c,saved}=setup();
 const fields={'cust-name':{value:'Demo Name'},'cust-phone':{value:'96891234567'},'cust-address':{value:'Demo delivery address'}};
 c.document.getElementById=id=>fields[id] || null;
 c.event={preventDefault(){},target:{querySelector(){return {disabled:false};}}};
 load('js/pages/checkout.js');
 run("setAuthSession({id:1,name:'A'});addToCart({productId:'old',price:10});submitOrderToDashboard=async order=>{setAuthSession({id:2,name:'B'});addToCart({productId:'new',price:20});return {orderId:order.orderId}};notifyCommerce=()=>{};showFieldError=()=>{}");
 await run('handleCheckoutSubmit(event)');
 assert.equal(run('cart[0].productId'),'new');
 assert.equal(JSON.parse(saved['cart:user:1']).length,0);
 assert.equal(JSON.parse(saved['cart:user:2'])[0].productId,'new');
 assert.equal(c.window.location.href,'https://example.com/shop/');
});
