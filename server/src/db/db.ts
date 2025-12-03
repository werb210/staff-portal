import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

// NOTE: for now the app boots even if DATABASE_URL is missing
const connectionString = process.env.DATABASE_URL || "";

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("azure") ? { rejectUnauthorized: false } : false,
});

// Single Drizzle instance
const db = drizzle(pool);

export default db;
