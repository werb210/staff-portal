import db from "../db.js";

export interface NotificationRecord {
  id: string;
  userId: string | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationsRepo = {
  async listForUser(userId: string): Promise<NotificationRecord[]> {
    return db
      .selectFrom("notifications")
      .selectAll()
      .where("userId", "=", userId)
      .orderBy("createdAt", "desc")
      .execute();
  },

  async listUnread(userId: string) {
    return db
      .selectFrom("notifications")
      .selectAll()
      .where("userId", "=", userId)
      .where("read", "=", false)
      .orderBy("createdAt", "desc")
      .execute();
  },

  async create(data: Partial<NotificationRecord>) {
    const row = await db
      .insertInto("notifications")
      .values({
        userId: data.userId ?? null,
        type: data.type ?? "general",
        message: data.message ?? "",
        read: false,
      })
      .returningAll()
      .executeTakeFirst();

    return row as NotificationRecord;
  },

  async markRead(id: string) {
    return db
      .updateTable("notifications")
      .set({ read: true })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  },
};

export default notificationsRepo;
