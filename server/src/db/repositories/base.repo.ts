import { db } from "../client.js";
import { eq } from "drizzle-orm";

export class BaseRepo {
  constructor(table) {
    this.table = table;
  }

  async findAll() {
    return db.select().from(this.table);
  }

  async findById(id) {
    const rows = await db.select().from(this.table).where(eq(this.table.id, id));
    return rows[0] || null;
  }

  async create(data) {
    const rows = await db.insert(this.table).values(data).returning();
    return rows[0] || null;
  }

  async update(id, data) {
    const rows = await db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();
    return rows[0] || null;
  }

  async delete(id) {
    const rows = await db.delete(this.table).where(eq(this.table.id, id)).returning();
    return rows[0] || null;
  }
}
