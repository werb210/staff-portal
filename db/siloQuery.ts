import { db } from "../db";

export async function siloQuery(silo: string, query: string, params: unknown[] = []) {
  if (!query.toLowerCase().includes("where")) {
    throw new Error("All silo queries must include WHERE clause");
  }

  const safeQuery = query.replace(/where/i, `WHERE silo = '${silo}' AND`);
  return db.query(safeQuery, params);
}
