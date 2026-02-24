import { db } from "../db";

const VALID_SILOS = new Set(["BF", "BI", "SLF"]);

export async function siloQuery(silo: string, query: string, params: unknown[] = []) {
  if (!VALID_SILOS.has(silo)) {
    throw new Error("Invalid silo assignment");
  }

  await db.query("SET app.current_silo = $1", [silo]);
  return db.query(query, params);
}
