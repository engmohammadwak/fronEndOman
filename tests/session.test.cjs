const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const KEY = 'techpro_demo_session_v2';
function storage(data) {
  return {getItem:key=>data[key] ?? null,setItem:(key,value)=>data[key]=String(value),removeItem:key=>delete data[key]};
}
function page(local = {}, tab = {}) {
  const events = {};
  const emitted = [];
  const context = vm.createContext({
    URL, console, localStorage:storage(local),sessionStorage:storage(tab),
    CustomEvent:class {constructor(type, init) {this.type=type;this.detail=init?.detail;}},
    document:{currentScript:{src:'https://example.com/shop/js/main.js'},addEventListener(){},getElementById(){return null;}},
    window:{TECHPRO_CONFIG:{mode:'demo'},addEventListener(type,handler){events[type]=handler;},dispatchEvent(event){emitted.push(event);}},
  });
  for(const file of ['js/api.js','js/main.js','js/auth-state.js']) vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  return {events,emitted,context,run:code=>vm.runInContext(code,context)};
}
test('session and account cart survive reload and a fresh tab',()=>{
 const local={};const first=page(local);
 first.run("setAuthSession({id:42,name:'Preview'});addToCart({productId:'p1',price:12})");
 for (let reload=0;reload<3;reload++) {
  const next=page(local,{});
  assert.equal(next.run('getAuthSession().id'),42);
  assert.equal(next.run('cart[0].productId'),'p1');
 }
});
test('existing tab session migrates before account cart is restored',()=>{
 const local={'cart:user:42':JSON.stringify([{price:12,productId:'p1'}])};
 const tab={[KEY]:JSON.stringify({loggedIn:true,id:42,name:'Preview'})};
 const current=page(local,tab);
 assert.equal(current.run('cart[0].productId'),'p1');
 assert.equal(JSON.parse(local[KEY]).id,42);assert.equal(tab[KEY],undefined);
});
test('explicit logout persists and a stale legacy tab cannot restore login',()=>{
 const local={};const first=page(local);
 first.run("setAuthSession({id:42,name:'Preview'})");
 const stale={[KEY]:local[KEY]};first.run('clearAuthSession()');
 assert.equal(page(local,stale).run('getAuthSession()'),null);
 assert.equal(page(local).run('getAuthSession()'),null);
});
test('cross-tab logout restores guest cart and emits state change',()=>{
 const local={cart:JSON.stringify([{productId:'guest',price:1}])};
 const first=page(local);first.run("setAuthSession({id:42,name:'Preview'});addToCart({productId:'member',price:2})");
 const second=page(local);second.run('clearAuthSession()');
 first.events.storage({key:KEY});
 assert.equal(first.run('getAuthSession()'),null);
 assert.equal(first.run('cart[0].productId'),'guest');
 assert.equal(first.emitted[0].detail.sessionChanged,true);
});
test('malformed persistent session never selects an account namespace',()=>{
 for(const raw of ['broken','null','{"loggedIn":true}','{"loggedIn":true,"id":{},"name":"bad"}']) {
  const current=page({[KEY]:raw});
  assert.equal(current.run('getAuthSession()'),null);
  assert.equal(current.run("stateStorageKey('cart')"),'cart');
 }
});
test('blocked persistent storage never claims successful login',()=>{
 const current=page();
 current.context.localStorage.setItem=()=>{throw Error('blocked');};
 assert.throws(()=>current.run("setAuthSession({id:42,name:'Preview'})"));
 assert.equal(current.run('getAuthSession()'),null);
});
test('invalid cart additions return failure and blocked writes roll back',()=>{
 const current=page();
 assert.equal(current.run('addToCart({price:NaN})'),false);
 current.run('addToCart({productId:1,price:12})');
 current.context.localStorage.setItem=()=>{throw Error('blocked');};
 assert.equal(current.run('addToCart({productId:1,price:12})'),false);
 assert.equal(current.run('cart[0].qty'),1);
 assert.equal(current.run('clearCart()'),false);
 assert.equal(current.run('cart.length'),1);
});
