import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../db.js";
import { notifications } from "../schema/notifications.js";

export type NotificationRecord = typeof notifications.$inferSelect;

export interface NotificationCreateInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  applicationId?: string | null;
  contactId?: string | null;
  relatedEntity?: string | null;
  relatedId?: string | null;
  read?: boolean;
}

const notificationsRepo = {
  async listForUser(userId: string) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  },

  async unreadCount(userId: string) {
    const [row] = await db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return Number(row?.value ?? 0);
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
    return db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .returning();
  },

  async create(data: NotificationCreateInput) {
    const [row] = await db
      .insert(notifications)
      .values({ ...data, read: data.read ?? false })
      .returning();
    return row;
  },

  async delete(id: string) {
    const [row] = await db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
    return row;
  }
};

export default notificationsRepo;
