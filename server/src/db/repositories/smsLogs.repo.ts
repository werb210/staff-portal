import { desc, eq } from "drizzle-orm";
import db from "../db.js";
import { smsLogs } from "../schema/smsLogs.js";

export type SmsLogRecord = typeof smsLogs.$inferSelect;
export type SmsLogInsert = typeof smsLogs.$inferInsert;

export const smsLogsRepo = {
  async getAll(): Promise<SmsLogRecord[]> {
    return db.select().from(smsLogs).orderBy(desc(smsLogs.created_at));
  },

  async getById(id: string): Promise<SmsLogRecord | undefined> {
    const [record] = await db.select().from(smsLogs).where(eq(smsLogs.id, id));
    return record;
  },

  async getByContact(contactId: string): Promise<SmsLogRecord[]> {
    return db
      .select()
      .from(smsLogs)
      .where(eq(smsLogs.contact_id, contactId))
      .orderBy(desc(smsLogs.created_at));
  },

  async create(data: SmsLogInsert) {
    const [row] = await db
      .insert(smsLogs)
      .values({
        status: data.status ?? "sent",
        ...data,
      })
      .returning();

    return row;
  },
};
