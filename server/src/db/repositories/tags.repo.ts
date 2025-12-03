import { db } from "../db.js";
import { tags } from "../schema/tags.js";
import { eq, ilike } from "drizzle-orm";

export default {
  async findAll() {
    return db.select().from(tags);
  },

  async search(query: string) {
    return db.select().from(tags).where(ilike(tags.name, `%${query}%`));
  },

  async create(data: Omit<typeof tags.$inferInsert, "id">) {
    const rows = await db.insert(tags).values(data).returning();
    return rows[0];
  },

  async delete(id: number) {
    return db.delete(tags).where(eq(tags.id, id));
  }
};
