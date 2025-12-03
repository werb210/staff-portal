import db from "../db.js";
import { contacts } from "../schema/contacts.js";
import { eq } from "drizzle-orm";

export default {
  async findMany() {
    return await db.select().from(contacts);
  },

  async findById(id: string) {
    const rows = await db.select().from(contacts).where(eq(contacts.id, id));
    return rows[0] || null;
  },

  async create(data: any) {
    const rows = await db.insert(contacts).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: any) {
    const rows = await db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
    return rows[0];
  },

  async delete(id: string) {
    const rows = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return rows[0];
  }
};
