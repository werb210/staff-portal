import db from "../db.js";
import { users } from "../schema/users.js";
import { eq } from "drizzle-orm";

export default {
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  },

  async create(data: any) {
    const inserted = await db.insert(users).values(data).returning();
    return inserted[0];
  }
};
