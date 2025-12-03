import { db } from "../db.js";
import { lenders } from "../schema/lenders.js";
import { eq, ilike } from "drizzle-orm";

export default {
  async findAll() {
    return db.select().from(lenders);
  },

  async search(query: string) {
    return db.select().from(lenders).where(ilike(lenders.name, `%${query}%`));
  },

  async findById(id: number) {
    const rows = await db.select().from(lenders).where(eq(lenders.id, id));
    return rows[0] || null;
  },

  async create(data: Omit<typeof lenders.$inferInsert, "id">) {
    const rows = await db.insert(lenders).values(data).returning();
    return rows[0];
  },

  async update(id: number, data: Partial<typeof lenders.$inferInsert>) {
    const rows = await db.update(lenders).set(data).where(eq(lenders.id, id)).returning();
    return rows[0];
  }
};
