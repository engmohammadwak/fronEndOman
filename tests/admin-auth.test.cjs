const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('admin trusts server cookie session, restores on reload, and retains session when logout fails', async () => {
  let authenticated = false;
  let offline = false;
  const fetch = async (url, options) => {
    assert.equal(options.credentials, 'same-origin');
    if (offline) throw new Error('offline');
    if (url.endsWith('/login')) authenticated = JSON.parse(options.body).password === 'test-only';
    if (url.endsWith('/logout')) authenticated = false;
    const ok = authenticated || url.endsWith('/logout');
    return {ok,status:ok ? 200 : 401,json:async()=>({ok:true,email:'test-admin'})};
  };
  const load = () => {
    const context = vm.createContext({fetch,AbortSignal,
      window:{location:{pathname:'/dashboard',replace(){}}},
      document:{body:{dataset:{}},getElementById(){return null;},addEventListener(){}},
      localStorage:{getItem:()=>'{"email":"forged-admin"}',setItem(){}},
      sessionStorage:{removeItem(){}}, applyAdminDir(){}, adminLang:()=>'ar', t:key=>key
    });
    vm.runInContext(fs.readFileSync('js/admin/admin-auth.js','utf8'),context);
    return context.window.AdminAuth;
  };
  let auth = load();
  assert.equal(auth.session(),null);
  assert.equal(await auth.login('test-admin','wrong'),false);
  assert.equal(await auth.login('test-admin','test-only'),true);
  auth = load();
  await auth.boot();
  assert.equal(auth.session().email,'test-admin');
  offline = true;
  await assert.rejects(auth.logout(),/offline/);
  assert.equal(auth.session().email,'test-admin');
  offline = false;
  await auth.logout();
  assert.equal(auth.session(),null);
  await auth.boot();
  assert.equal(auth.session(),null);
});

function authContext(fetch) {
  const redirects=[];
  const context=vm.createContext({fetch,AbortSignal,
    window:{location:{pathname:'/dashboard/home',replace:url=>redirects.push(url)}},
    document:{body:{dataset:{}},getElementById:()=>null,addEventListener(){}},
    localStorage:{setItem(){}},sessionStorage:{removeItem(){}}
  });
  vm.runInContext(fs.readFileSync('js/admin/admin-auth.js','utf8'),context);
  return {auth:context.window.AdminAuth,redirects};
}

test('concurrent initialization shares one request and late session cannot undo logout',async()=>{
  let resolveSession;let calls=0;
  const {auth,redirects}=authContext(async url=>{
    if(url.endsWith('/logout'))return {ok:true,status:200,json:async()=>({ok:true})};
    calls++;return new Promise(resolve=>{resolveSession=resolve;});
  });
  const first=auth.boot();const second=auth.boot();
  assert.equal(first,second);assert.equal(calls,1);
  assert.equal(auth.guard(),false);assert.equal(redirects.length,0);
  await auth.logout();
  resolveSession({ok:true,status:200,json:async()=>({ok:true,email:'late-admin'})});
  await first;
  assert.equal(auth.session(),null);assert.equal(auth.status(),'anonymous');
});

test('invalid session payload fails closed without redirecting and retry restores session',async()=>{
  let malformed=true;
  const {auth,redirects}=authContext(async()=>({ok:true,status:200,json:async()=>malformed?{}:{ok:true,email:'admin'}}));
  await auth.boot();assert.equal(auth.status(),'error');assert.equal(auth.session(),null);assert.equal(redirects.length,0);
  malformed=false;await auth.boot();assert.equal(auth.session().email,'admin');assert.equal(auth.status(),'authenticated');
});
