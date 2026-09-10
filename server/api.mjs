/**
 * cPanel / Passenger entry point.
 * Uses Express + absolute root paths + process.env.PORT (TCP or Unix socket).
 */
import './env.mjs';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './handlers.mjs';
import { loadAppRoutes } from './load-routes.mjs';
import { isHttpsRequest } from './admin-auth.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const AppRoutes = loadAppRoutes(rootDir);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json'
};

const BLOCKED = /(?:^|\/)(?:\.git|node_modules|All|tests|scripts|docs|server|data|agent-transcripts)(?:\/|$)/i;

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
    ...headers
  });
  res.end(body);
}

function redirect(res, to) {
  send(res, 302, '', { Location: to });
}

function safeJoin(urlPath) {
  const relative = urlPath.replace(/^\/+/, '');
  const target = path.resolve(rootDir, relative);
  if (target !== rootDir && !target.startsWith(rootDir + path.sep)) return null;
  return target;
}

function injectRoutes(html, filePath) {
  const base = new URL(path.relative(rootDir, filePath).split(path.sep).join('/'), 'http://local/');
  html = html.replace(/(href|src)="([^"#]+)"/g, (full, attr, value) => {
    if (/^(?:[a-z]+:|\/\/)/i.test(value)) return full;
    const resolved = new URL(value, base);
    return `${attr}="${AppRoutes.LEGACY[resolved.pathname] || resolved.pathname}${resolved.search}${resolved.hash}"`;
  });
  if (html.includes('js/app-routes.js')) return html;
  return html.replace(
    /(<script[^>]+src="[^"]*js\/(?:main|admin\/admin-auth)\.js[^"]*"><\/script>)/,
    '<script src="/js/app-routes.js?v=routes-1"></script>\n  $1'
  );
}

function serveFile(res, filePath, asHtml) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    if (asHtml || ext === '.html') {
      send(res, 200, injectRoutes(data.toString('utf8'), filePath), { 'Content-Type': MIME['.html'] });
      return;
    }
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  });
}

async function handleRequest(req, res) {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.originalUrl || req.url || '/', `${req.protocol}://${host}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    send(res, 400, 'Invalid URL');
    return;
  }

  if (!['GET', 'HEAD', 'POST', 'PUT'].includes(req.method)) {
    send(res, 405, 'Method not allowed');
    return;
  }

  if (pathname.startsWith('/api/')) {
    if (req.headers.origin) {
      try {
        if (new URL(req.headers.origin).host !== req.headers.host) {
          send(res, 403, 'Cross-origin request denied');
          return;
        }
      } catch {
        send(res, 403, 'Cross-origin request denied');
        return;
      }
    }
    if (!['GET', 'HEAD'].includes(req.method) && !String(req.headers['content-type'] || '').includes('application/json')) {
      send(res, 415, 'JSON required');
      return;
    }
    try {
      // Expose HTTPS detection for Set-Cookie Secure behind Passenger proxy.
      req.isHttps = isHttpsRequest(req);
      const handled = await handleApi(req, res, url);
      if (!handled) {
        send(res, 404, JSON.stringify({ ok: false, error: 'Endpoint not found' }), {
          'Content-Type': 'application/json; charset=utf-8'
        });
      }
    } catch (error) {
      send(
        res,
        error.status || 500,
        JSON.stringify({ error: error.status ? error.message : 'Server error' }),
        { 'Content-Type': 'application/json; charset=utf-8' }
      );
    }
    return;
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    send(res, 405, 'Method not allowed');
    return;
  }
  if (pathname.split('/').some((part) => part.startsWith('.'))) {
    send(res, 404, 'Not found');
    return;
  }
  if (BLOCKED.test(pathname) || pathname.includes('\\') || pathname.includes('\0')) {
    send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  const legacy = AppRoutes.LEGACY[pathname]
    || (pathname.endsWith('.html') && AppRoutes.FILES[pathname.slice(0, -5)] ? pathname.slice(0, -5) : null);
  if (legacy) {
    redirect(res, `${legacy}${url.search}`);
    return;
  }

  const routed = AppRoutes.fileFor(pathname);
  if (routed) {
    serveFile(res, path.join(rootDir, routed), true);
    return;
  }

  if (pathname === '/favicon.ico') {
    send(res, 204, '');
    return;
  }

  if (!AppRoutes.isPublicAsset(pathname)) {
    send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  const target = safeJoin(pathname);
  if (!target || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }
  const real = fs.realpathSync(target);
  if (!real.startsWith(rootDir + path.sep)) {
    send(res, 404, 'Not found');
    return;
  }
  serveFile(res, real, false);
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  handleRequest(req, res).catch(() => {
    if (!res.headersSent) send(res, 500, 'Server error');
    else res.end();
  });
});

export { app, rootDir };
export default app;

const shouldListen = process.env.TECHPRO_NO_LISTEN !== '1';
if (shouldListen) {
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST;
  const onListen = () => {
    const address = server.address();
    const display = typeof address === 'string'
      ? address
      : `http://${['::', '0.0.0.0'].includes(address.address) ? 'localhost' : address.address}:${address.port}`;
    const ready = typeof address === 'string' ? `TechPro store ready at ${display}` : `TechPro store ready at ${display}/`;
    console.log(ready);
    if (typeof address !== 'string') {
      console.log(`Admin dashboard: http://${['::', '0.0.0.0'].includes(address.address) ? 'localhost' : address.address}:${address.port}/dashboard`);
    }
  };
  const server = HOST ? app.listen(PORT, HOST, onListen) : app.listen(PORT, onListen);
  server.on('error', (error) => {
    console.error(`Unable to start server (${error.code}). Check HOST and PORT.`);
    process.exitCode = 1;
  });
}
