import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPaymob, sealPaymob } from './secrets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.resolve(process.env.TECHPRO_DATA_DIR || path.join(root, 'data'));
const storeFile = path.join(dataDir, 'store.json');

function emptyStore() {
  return {
    orders: [],
    sessions: {},
    processedEvents: [],
    paymob: {
      enabled: false,
      baseUrl: 'https://oman.paymob.com',
      currency: 'OMR',
      amountMultiplier: 1000,
      mode: 'intention',
      integrationId: '',
      iframeId: '',
      secretKey: '',
      publicKey: '',
      hmacSecret: '',
      apiKey: ''
    }
  };
}

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true, mode:0o700 });
}

export function readStore() {
  try {
    ensureDir();
    if (!fs.existsSync(storeFile)) return emptyStore();
    const parsed = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
    const base = emptyStore();
    return {
      ...base,
      ...parsed,
      paymob: openPaymob({ ...base.paymob, ...(parsed.paymob || {}) }),
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      processedEvents: Array.isArray(parsed.processedEvents) ? parsed.processedEvents : [],
      sessions: parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {}
    };
  } catch (cause) {
    throw new Error("Cannot read server data; refusing to overwrite it", {cause});
  }
}

export function writeStore(next) {
  ensureDir();
  const tmp = `${storeFile}.tmp`;
  const persisted = { ...next, paymob: sealPaymob(next.paymob || emptyStore().paymob) };
  fs.writeFileSync(tmp, JSON.stringify(persisted, null, 2), {mode:0o600});
  fs.renameSync(tmp, storeFile);
  return next;
}

export function updateStore(mutator) {
  const current = readStore();
  const next = mutator(current) || current;
  return writeStore(next);
}
