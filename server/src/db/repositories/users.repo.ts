import db from "../db.js";
import { users } from "../schema/users.js";
import { eq } from "drizzle-orm";

export default {
  async findAll() {
    return db.select().from(users);
  },

  async findById(id: number) {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0] || null;
  },

  async findByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] || null;
  },

  async create(data: Omit<typeof users.$inferInsert, "id">) {
    const rows = await db.insert(users).values(data).returning();
    return rows[0];
  },

  async update(id: number, data: Partial<typeof users.$inferInsert>) {
    const rows = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return rows[0];
  }
};
