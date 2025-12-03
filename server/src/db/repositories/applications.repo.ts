import { db } from "../db.js";
import { applications } from "../schema/applications.js";
import { eq } from "drizzle-orm";

export default {
  async findAll() {
    return db.select().from(applications);
  },

  async findById(id: number) {
    const rows = await db.select().from(applications).where(eq(applications.id, id));
    return rows[0] || null;
  },

  async create(data: Omit<typeof applications.$inferInsert, "id">) {
    const rows = await db.insert(applications).values(data).returning();
    return rows[0];
  },

  async update(id: number, data: Partial<typeof applications.$inferInsert>) {
    const rows = await db.update(applications).set(data).where(eq(applications.id, id)).returning();
    return rows[0];
  }
};
