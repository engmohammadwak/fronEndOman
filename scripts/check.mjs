import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadAppRoutes } from '../server/load-routes.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AppRoutes = loadAppRoutes(rootDir);
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
let failures = [];
for (const file of [
  ...files('js').filter(f => f.endsWith('.js')),
  ...files('server').filter(f => f.endsWith('.mjs')),
  ...files('scripts').filter(f => f.endsWith('.mjs'))
]) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status) failures.push(result.stderr);
}
for (const file of ['index.html', ...files('pages').filter(f => f.endsWith('.html')), 'components/header.html', 'components/footer.html']) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) failures.push(`Duplicate IDs: ${file}`);
  for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(value)) continue;
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    if (!clean) continue;
    const routed = AppRoutes.fileFor(clean) || AppRoutes.FILES[clean];
    const target = routed || (clean.startsWith('/') ? clean.slice(1) : path.join(path.dirname(file), clean));
    if (!fs.existsSync(target)) failures.push(`${file}: missing ${value}`);
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('All application scripts parse; HTML IDs and local asset links pass.');
