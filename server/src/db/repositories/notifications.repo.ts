import { desc, eq } from "drizzle-orm";
import { db } from "../db.js";
import { notifications } from "../schema/notifications.js";

export type NotificationRecord = typeof notifications.$inferSelect;
export type NotificationInsert = typeof notifications.$inferInsert;

export const notificationsRepo = {
  async getAll(): Promise<NotificationRecord[]> {
    return db.select().from(notifications).orderBy(desc(notifications.created_at));
  },

  async getById(id: string): Promise<NotificationRecord | undefined> {
    const [record] = await db.select().from(notifications).where(eq(notifications.id, id));
    return record;
  },

  async getByContact(contactId: string): Promise<NotificationRecord[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.contact_id, contactId))
      .orderBy(desc(notifications.created_at));
  },

  async create(data: NotificationInsert) {
    const [row] = await db.insert(notifications).values({ read: false, ...data }).returning();
    return row;
  },

  async markRead(id: string) {
    return db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).execute();
  },

  async delete(id: string) {
    return db.delete(notifications).where(eq(notifications.id, id)).execute();
  },
};
