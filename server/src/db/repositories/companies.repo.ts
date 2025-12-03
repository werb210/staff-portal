import db from "../db";
import { companies } from "../schema/companies";
import { eq } from "drizzle-orm";

export default {
  async findMany() {
    return await db.select().from(companies);
  },

  async findById(id: string) {
    const rows = await db.select().from(companies).where(eq(companies.id, id));
    return rows[0] || null;
  },

  async create(data: any) {
    const rows = await db.insert(companies).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: any) {
    const rows = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
    return rows[0];
  },

  async delete(id: string) {
    const rows = await db.delete(companies).where(eq(companies.id, id)).returning();
    return rows[0];
  }
};
