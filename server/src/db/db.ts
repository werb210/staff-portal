// server/src/db/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connection = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  max: 10,
});

export const db = drizzle(connection);

export default db;
