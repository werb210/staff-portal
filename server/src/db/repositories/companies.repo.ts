import db from "../db.js";
import { companies } from "../schema/companies.js";
import { eq, ilike } from "drizzle-orm";

export default {
  async findAll() {
    return db.select().from(companies);
  },

  async search(query: string) {
    return db.select().from(companies).where(ilike(companies.name, `%${query}%`));
  },

  async findById(id: number) {
    const rows = await db.select().from(companies).where(eq(companies.id, id));
    return rows[0] || null;
  },

  async create(data: Omit<typeof companies.$inferInsert, "id">) {
    const rows = await db.insert(companies).values(data).returning();
    return rows[0];
  },

  async update(id: number, data: Partial<typeof companies.$inferInsert>) {
    const rows = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
    return rows[0];
  }
};
