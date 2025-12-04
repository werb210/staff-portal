import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { ENV } from "../config/env.js";

const { Pool } = pkg;

if (!ENV.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 5000,
});

export const db = drizzle(pool);
