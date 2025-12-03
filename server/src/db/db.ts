import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// default export (NOT named export)
const db = drizzle(pool);
export default db;
