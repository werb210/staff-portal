import { db } from "../db.js";

/**
 * A minimal base repository class that all other repos will extend.
 * Provides:
 *   - this.db : drizzle instance
 */
export class BaseRepository {
  protected db = db;

  constructor() {
    if (!this.db) {
      console.warn("[WARN] Drizzle DB not initialized");
    }
  }
}
