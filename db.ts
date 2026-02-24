export type QueryableDb = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};

const globalDb = (globalThis as { __STAFF_PORTAL_DB__?: QueryableDb }).__STAFF_PORTAL_DB__;

if (!globalDb) {
  throw new Error("Database client is not configured on globalThis.__STAFF_PORTAL_DB__");
}

export const db = globalDb;
