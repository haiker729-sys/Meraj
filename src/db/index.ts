import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    global._postgresPool = new Pool(
      connectionString
        ? { connectionString, connectionTimeoutMillis: 3000 }
        : {
            host: process.env.SQL_HOST || '127.0.0.1',
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DB_NAME,
            max: 10,
            connectionTimeoutMillis: 3000,
          }
    );

    global._postgresPool.on('error', (err) => {
      // Suppress unhandled idle client error if DB is offline
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Postgres Pool Warning]:', err.message);
      }
    });
  }
  return global._postgresPool;
};

export const pool = createPool();

let drizzleDb: any;
try {
  drizzleDb = drizzle(pool, { schema });
} catch {
  console.warn('[AI Studio] PostgreSQL not connected — using proxy for drizzle');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({})
  };
  drizzleDb = new Proxy({}, {
    get: (_, prop) => prop === 'query' ? new Proxy({}, { get: () => noOp }) : async () => []
  });
}

export const db = drizzleDb;

