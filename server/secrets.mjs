import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.resolve(process.env.TECHPRO_DATA_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data'));
const keyFile = path.join(dataDir, '.key');

function loadKey(create = false) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true, mode:0o700 });
  if (!fs.existsSync(keyFile)) {
    if (!create) throw new Error('Encryption key missing; restore the original key from backup');
    fs.writeFileSync(keyFile, crypto.randomBytes(32), {mode:0o600,flag:'wx'});
  }
  const key = fs.readFileSync(keyFile);
  if (key.length !== 32) throw new Error('Invalid encryption key');
  return key;
}

export function seal(plain) {
  if (!plain) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', loadKey(true), iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return `enc:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${enc.toString('hex')}`;
}

export function open(value) {
  const raw = String(value || '');
  if (!raw) return '';
  if (!raw.startsWith('enc:')) return raw;
  const [, ivHex, tagHex, dataHex] = raw.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', loadKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
}

const SECRET_FIELDS = ['secretKey', 'hmacSecret', 'apiKey'];

export function sealPaymob(paymob) {
  const next = { ...paymob };
  for (const field of SECRET_FIELDS) next[field] = seal(next[field]);
  return next;
}

export function openPaymob(paymob) {
  const next = { ...paymob };
  for (const field of SECRET_FIELDS) next[field] = open(next[field]);
  return next;
}
