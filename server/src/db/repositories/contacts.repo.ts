import db from "../db.js";
import { contacts } from "../schema/contacts.js";
import { eq, and, ilike } from "drizzle-orm";

export default {
  async findAll() {
    return db.select().from(contacts);
  },

  async search(query: string) {
    return db
      .select()
      .from(contacts)
      .where(ilike(contacts.name, `%${query}%`));
  },

  async findById(id: number) {
    const rows = await db.select().from(contacts).where(eq(contacts.id, id));
    return rows[0] || null;
  },

  async create(data: Omit<typeof contacts.$inferInsert, "id">) {
    const rows = await db.insert(contacts).values(data).returning();
    return rows[0];
  },

  async update(id: number, data: Partial<typeof contacts.$inferInsert>) {
    const rows = await db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
    return rows[0];
  }
};
