import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

async function start(directory) {
  const child = spawn(process.execPath,['server/api.mjs'],{env:{...process.env,PORT:'0',HOST:'127.0.0.1',TECHPRO_DATA_DIR:directory,TECHPRO_ADMIN_EMAIL:'integration-admin',TECHPRO_ADMIN_PASSWORD:'integration-password-only'}});
  const base = await new Promise((resolve,reject)=>{
    let output='';
    const timeout=setTimeout(()=>reject(new Error('Server startup timed out: '+output)),10000);
    child.stdout.on('data',chunk=>{output+=chunk; const match=output.match(/ready at (http:\/\/[^/]+)/);if(match){clearTimeout(timeout);resolve(match[1]);}});
    child.stderr.on('data',chunk=>{output+=chunk;});
    child.once('error',error=>{clearTimeout(timeout);reject(error);});
    child.once('exit',code=>{clearTimeout(timeout);reject(new Error(`Server exited ${code}: ${output}`));});
  }).catch(error=>{child.kill();throw error;});
  return {base,stop:()=>new Promise(resolve=>{child.once('exit',resolve);child.kill();})};
}

test('HTTP clean routes, private files, admin cookie persistence and safe checkout boundaries',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'techpro-server-test-'));
  let server;
  try {
    server=await start(directory);
    const get=(route,options)=>fetch(server.base+route,options);
    const post=(route,body,cookie)=>get(route,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
    for(const route of ['/dashboard','/new-devices','/refurbished-devices']) {
      const response=await get(route);assert.equal(response.status,200,route);
      const html=await response.text();assert.ok(!/src="\.\.\//.test(html));
    }
    const legacy=await get('/pages/storefront/refurbished-devices.html?q=phone',{redirect:'manual'});
    assert.equal(legacy.status,302);assert.equal(legacy.headers.get('location'),'/refurbished-devices?q=phone');
    for(const route of ['/data/store.json','/server/api.mjs','/.env','/dashboard/missing','/assets/%252e%252e/data/store.json']) assert.equal((await get(route)).status,404,route);
    assert.equal((await get('/%zz')).status,400);
    assert.equal((await get('/api/admin/session')).status,401);
    const productsPublic = await get('/api/products');
    assert.equal(productsPublic.status, 200);
    const productsBody = await productsPublic.json();
    assert.equal(productsBody.ok, true);
    assert.ok(Array.isArray(productsBody.products));
    const categoriesPublic = await get('/api/categories');
    assert.equal(categoriesPublic.status, 200);
    const categoriesBody = await categoriesPublic.json();
    assert.equal(categoriesBody.ok, true);
    assert.ok(categoriesBody.categories.length >= 1);
    assert.equal((await post('/api/admin/login',{email:'integration-admin',password:'wrong'})).status,401);
    const login=await post('/api/admin/login',{email:'integration-admin',password:'integration-password-only'});
    assert.equal(login.status,200);
    const setCookie=login.headers.get('set-cookie');assert.match(setCookie,/HttpOnly/);assert.match(setCookie,/SameSite=Lax/);
    const cookie=setCookie.split(';')[0];
    assert.equal((await get('/api/admin/session',{headers:{Cookie:cookie}})).status,200);
    assert.equal((await get('/api/admin/session',{
      headers:{
        Cookie:cookie,
        Origin:'https://algorift.online',
        Host:'127.0.0.1:3000',
        'X-Forwarded-Host':'algorift.online',
        'X-Forwarded-Proto':'https'
      }
    })).status,200,'proxy origin + forwarded host must keep the session');
    const createCategory = await post('/api/admin/categories', {
      nameAr: 'تجريبي',
      nameEn: 'Test Cat',
      slug: 'test-cat',
      sortOrder: 5
    }, cookie);
    assert.equal(createCategory.status, 200);
    const created = await createCategory.json();
    assert.equal(created.ok, true);
    assert.equal(created.category.slug, 'test-cat');
    await server.stop();server=await start(directory);
    assert.equal((await get('/api/admin/session',{headers:{Cookie:cookie}})).status,200,'server restart preserves session');
    assert.equal((await get('/api/orders/private-order')).status,401);
    assert.equal((await post('/api/checkout/pay',{total:0.01})).status,503);
    assert.equal((await get('/api/payments/config').then(r=>r.json())).enabled,false);
    assert.equal((await post('/api/admin/logout',{},cookie)).status,200);
    assert.equal((await get('/api/admin/session',{headers:{Cookie:cookie}})).status,401);
    const invalid=await get('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(invalid.status,400);
    await writeFile(path.join(directory,'store.json'),'{broken');
    assert.equal((await get('/api/payments/config')).status,500,'corrupt data fails closed');
  } finally {if(server) await server.stop();await rm(directory,{recursive:true,force:true});}
});
