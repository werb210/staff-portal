import db from "../db.js";
import { users } from "../schema/users.js";
import { eq } from "drizzle-orm";

export const roleManagementRepo = {
  async list() {
    return db.select().from(users).orderBy(users.createdAt);
  },

  async updateRole(id: string, role: string) {
    const [row] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return row;
  },

  async toggleActive(id: string, active: boolean) {
    const [row] = await db
      .update(users)
      .set({ active })
      .where(eq(users.id, id))
      .returning();
    return row;
  },

  async createUser(data: any) {
    const [row] = await db.insert(users).values(data).returning();
    return row;
  },

  async resetPassword(id: string, passwordHash: string) {
    const [row] = await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, id))
      .returning();
    return row;
  },
};
