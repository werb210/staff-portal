import { db } from "../db.js";
import { notifications } from "../schema/notifications.js";
import { and, eq } from "drizzle-orm";

export const notificationsRepo = {
  async create(data: {
    userId: string;
    title: string;
    message: string;
    category: string;
  }) {
    const [row] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        title: data.title,
        message: data.message,
        category: data.category,
      })
      .returning();
    return row;
  },

  async list(userId: string) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  },

  async unread(userId: string) {
    return await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  },

  async markRead(id: string) {
    const [row] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return row;
  },

  async markAllRead(userId: string) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
    return true;
  },
};
