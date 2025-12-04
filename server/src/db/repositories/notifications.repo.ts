import { db } from "../db.js";
import { notifications } from "../schema/notifications.js";
import { eq } from "drizzle-orm";

export const notificationsRepo = {
  async create(data: {
    userId: string;
    title: string;
    message: string;
    category: string | null;
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

  async allForUser(userId: string) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  },

  async markRead(id: string) {
    const [row] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return row;
  },

  async unreadCount(userId: string) {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    return rows.filter((x) => !x.read).length;
  },
};
