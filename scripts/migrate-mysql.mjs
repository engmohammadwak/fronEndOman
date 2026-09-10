import '../server/env.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, mysqlConfigured, closePool } from '../server/mysql.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sqlDir = path.join(root, 'server/sql');

if (!mysqlConfigured()) {
  console.error('Configure DATABASE_URL or MYSQL_HOST/MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE first.');
  process.exit(1);
}

const files = fs.readdirSync(sqlDir)
  .filter((name) => name.endsWith('.sql'))
  .sort();

const pool = getPool();
try {
  for (const file of files) {
    const sqlFile = path.join(sqlDir, file);
    const sql = fs.readFileSync(sqlFile, 'utf8');
    const statements = sql
      .split(/;\s*\n/)
      .map((part) => part.trim())
      .filter((part) => part && !part.startsWith('--'));
    for (const statement of statements) {
      await pool.query(statement);
    }
    console.log('MySQL migration applied:', path.relative(root, sqlFile));
  }
} finally {
  await closePool();
}
