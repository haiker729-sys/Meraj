import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
  var _postgresPool: Pool | undefined;
}

export const hasPostgresConfig = (): boolean => {
  return Boolean(
    (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') ||
    (process.env.SQL_HOST && process.env.SQL_HOST.trim() !== '') ||
    (process.env.PGHOST && process.env.PGHOST.trim() !== '')
  );
};

export const createPool = () => {
  if (!global._postgresPool) {
    if (hasPostgresConfig()) {
      const connectionString = process.env.DATABASE_URL;
      global._postgresPool = new Pool(
        connectionString
          ? { connectionString, connectionTimeoutMillis: 3000 }
          : {
              host: process.env.SQL_HOST || process.env.PGHOST,
              user: process.env.SQL_USER || process.env.PGUSER,
              password: process.env.SQL_PASSWORD || process.env.PGPASSWORD,
              database: process.env.SQL_DB_NAME || process.env.PGDATABASE,
              max: 10,
              connectionTimeoutMillis: 3000,
            }
      );

      global._postgresPool.on('error', (err) => {
        console.warn('[Postgres Pool Warning]:', err.message);
      });
    } else {
      // Mock pool when no PostgreSQL connection string is configured
      global._postgresPool = {
        query: async () => {
          throw new Error('PostgreSQL credentials not configured. In-memory store active.');
        },
        on: () => {},
        end: async () => {}
      } as unknown as Pool;
    }
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

