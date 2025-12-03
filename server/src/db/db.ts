import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is missing — DB features disabled.");
}

/**
 * Shared Postgres connection pool + Drizzle client
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool);

export default db;
