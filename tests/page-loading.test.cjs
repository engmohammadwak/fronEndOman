const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
for(const file of ['index.html',...walk('pages').filter(f=>f.endsWith('.html'))]) {
 test(`script order: ${file}`,()=>{
  const document={currentScript:{src:''},readyState:'loading',addEventListener(){},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []},documentElement:{lang:'ar'},body:{dataset:{}},cookie:''};
  const context=vm.createContext({URL,URLSearchParams,console,document,window:{location:{href:`https://example.com/${file}`,search:'',pathname:`/${file}`},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},navigator:{}});
  const html=fs.readFileSync(file,'utf8');
  for(const [,src] of html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)) {
   if(/^https?:/.test(src)) continue;
   const clean=src.split('?')[0];
   const target=clean.startsWith('/')
     ? path.resolve(process.cwd(), clean.slice(1))
     : path.resolve(path.dirname(file), clean);
   document.currentScript.src=new URL(src,`https://example.com/${file}`).href;
   vm.runInContext(fs.readFileSync(target,'utf8'),context,{filename:target});
  }
 });
}
