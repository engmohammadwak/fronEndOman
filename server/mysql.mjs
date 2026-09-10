import './env.mjs';
import mysql from 'mysql2/promise';

let pool = null;

function env(name, fallback) {
  return process.env[name] ?? fallback;
}

export function mysqlConfigured() {
  return Boolean(
    process.env.DATABASE_URL
    || ((env('MYSQL_HOST') || env('DB_HOST')) && (env('MYSQL_DATABASE') || env('DB_NAME')) && (env('MYSQL_USER') || env('DB_USER')))
  );
}

export function getPool() {
  if (!mysqlConfigured()) {
    throw Object.assign(new Error('MySQL is not configured. Set DATABASE_URL, MYSQL_*, or DB_* env vars.'), { status: 503 });
  }
  if (!pool) {
    if (process.env.DATABASE_URL) {
      pool = mysql.createPool(process.env.DATABASE_URL);
    } else {
      pool = mysql.createPool({
        host: env('MYSQL_HOST') || env('DB_HOST') || '127.0.0.1',
        port: Number(env('MYSQL_PORT') || env('DB_PORT') || 3306),
        user: env('MYSQL_USER') || env('DB_USER'),
        password: env('MYSQL_PASSWORD') || env('DB_PASSWORD') || '',
        database: env('MYSQL_DATABASE') || env('DB_NAME'),
        waitForConnections: true,
        connectionLimit: Number(env('MYSQL_POOL_SIZE') || 15),
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        namedPlaceholders: true,
        timezone: 'Z'
      });
    }
  }
  return pool;
}

export async function withConnection(fn) {
  const connection = await getPool().getConnection();
  try {
    return await fn(connection);
  } finally {
    connection.release();
  }
}

export async function withTransaction(fn) {
  return withConnection(async (connection) => {
    await connection.beginTransaction();
    try {
      const result = await fn(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default {
  getConnection: (...args) => getPool().getConnection(...args),
  query: (...args) => getPool().query(...args),
  execute: (...args) => getPool().execute(...args),
  end: () => closePool()
};
