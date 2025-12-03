import db from "../db.js";
import { eq } from "drizzle-orm";
import { notifications, NotificationRecord, CreateNotification } from "../schema/notifications.js";

export const notificationsRepo = {
  async findForUser(userId: string): Promise<NotificationRecord[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  },

  async create(data: CreateNotification): Promise<NotificationRecord> {
    const [inserted] = await db.insert(notifications).values(data).returning();
    return inserted;
  },

  async markRead(id: number): Promise<NotificationRecord | undefined> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  },

  async delete(id: number): Promise<boolean> {
    const [deleted] = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return deleted ? true : false;
  },
};
