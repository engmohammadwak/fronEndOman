import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/** Load browser/CommonJS AppRoutes map under ESM ("type":"module") packages. */
export function loadAppRoutes(rootDir) {
  const file = path.join(rootDir, 'js', 'app-routes.js');
  const code = fs.readFileSync(file, 'utf8');
  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    globalThis: {},
    window: undefined
  };
  vm.runInNewContext(code, sandbox, { filename: file });
  if (!module.exports || typeof module.exports.fileFor !== 'function') {
    throw new Error('Failed to load AppRoutes');
  }
  return module.exports;
}
