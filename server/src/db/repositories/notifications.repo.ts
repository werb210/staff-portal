import db from "../db.js";
import { notifications } from "../schema/notifications.js";
import { eq, and } from "drizzle-orm";

export const notificationsRepo = {
  async create(data: any) {
    const [n] = await db.insert(notifications).values(data).returning();
    return n;
  },

  async listForUser(userId: string) {
    return db.select().from(notifications).where(eq(notifications.userId, userId));
  },

  async markRead(id: string, userId: string) {
    const [n] = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return n;
  },
};
