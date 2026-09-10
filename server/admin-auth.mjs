import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { readStore, updateStore } from './db.mjs';
const scrypt = promisify(crypto.scrypt);
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const credentialFile = path.resolve(process.env.TECHPRO_DATA_DIR || fileURLToPath(new URL('../data/', import.meta.url)), 'admin-auth.json');
export function parseCookies(header) {
  const cookies = {};
  for (const part of String(header || '').split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    try { cookies[part.slice(0,index).trim()] = decodeURIComponent(part.slice(index+1).trim()); } catch {}
  }
  return cookies;
}
export function adminSession(req) {
  const token = parseCookies(req.headers.cookie).techpro_admin;
  if (!token || !/^[a-f0-9]{48}$/.test(token)) return null;
  const key = crypto.createHash('sha256').update(token).digest('hex');
  const session = readStore().sessions[key];
  return session && session.exp > Date.now() ? session : null;
}
export async function checkAdminCredentials(username, password) {
  let config;
  if (fs.existsSync(credentialFile)) config = JSON.parse(fs.readFileSync(credentialFile, 'utf8'));
  else if (process.env.TECHPRO_ADMIN_EMAIL && process.env.TECHPRO_ADMIN_PASSWORD) {
    const actual = crypto.createHash('sha256').update(String(password)).digest();
    const expected = crypto.createHash('sha256').update(process.env.TECHPRO_ADMIN_PASSWORD).digest();
    return crypto.timingSafeEqual(actual,expected) && username === process.env.TECHPRO_ADMIN_EMAIL.toLowerCase();
  } else throw Object.assign(new Error('Run npm run setup:admin to configure the administrator.'), { status:503 });
  const actual = await scrypt(String(password), config.salt, 64);
  return crypto.timingSafeEqual(actual, Buffer.from(config.hash,'hex')) && username === config.username;
}
export function createAdminSession(email) {
  const token = crypto.randomBytes(24).toString('hex');
  const key = crypto.createHash('sha256').update(token).digest('hex');
  updateStore(store => {
    for (const [id, session] of Object.entries(store.sessions)) if (session.exp <= Date.now()) delete store.sessions[id];
    store.sessions[key] = {email,exp:Date.now()+SESSION_TTL_MS};return store;
  });
  return token;
}
export function destroyAdminSession(req) {
  const token = parseCookies(req.headers.cookie).techpro_admin;
  if (!token) return;
  const key = crypto.createHash('sha256').update(token).digest('hex');
  updateStore(store=>{delete store.sessions[key];return store;});
}
export function isHttpsRequest(req) {
  if (process.env.COOKIE_SECURE === '1') return true;
  if (process.env.COOKIE_SECURE === '0') return false;
  if (process.env.TECHPRO_PUBLIC_URL?.startsWith('https://')) return true;
  if (req?.isHttps === true) return true;
  if (req?.secure === true) return true;
  const xf = req?.headers?.['x-forwarded-proto'];
  if (xf) return String(xf).split(',')[0].trim().toLowerCase() === 'https';
  return false;
}

export function sessionCookie(token, maxAge = SESSION_TTL_MS / 1000, options = {}) {
  // SameSite=Lax works with HTTPS↔proxy and top-level navigations after login.
  // Secure follows the public HTTPS signal (X-Forwarded-Proto / TECHPRO_PUBLIC_URL).
  const useSecure = options.secure ?? isHttpsRequest(options.req);
  const secure = useSecure ? '; Secure' : '';
  return `techpro_admin=${token || ''}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

// Bound memory and slow credential guessing without trusting proxy headers.
const attempts = new Map();
export function limitLoginAttempts(address) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
  const entry = attempts.get(address) || {count:0, until:now + 15 * 60 * 1000};
  if (entry.count >= 10 || (!attempts.has(address) && attempts.size >= 10000)) {
    throw Object.assign(new Error('Too many login attempts. Try again later.'), {status:429});
  }
  entry.count += 1;
  attempts.set(address, entry);
}
