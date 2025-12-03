import db from "../db.js";
import { notifications } from "../schema/notifications.js";
import { eq } from "drizzle-orm";

export type NotificationRecord = typeof notifications.$inferSelect;
export type CreateNotification = typeof notifications.$inferInsert;

export const notificationsRepo = {
  async getAll(): Promise<NotificationRecord[]> {
    return db.select().from(notifications);
  },

  async getById(id: string): Promise<NotificationRecord | undefined> {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return rows[0];
  },

  async create(data: CreateNotification): Promise<NotificationRecord> {
    const [row] = await db.insert(notifications).values(data).returning();
    return row;
  },

  async update(
    id: string,
    data: Partial<CreateNotification>
  ): Promise<NotificationRecord> {
    const [row] = await db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    return row;
  }
};
