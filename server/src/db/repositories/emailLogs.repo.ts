import { desc, eq } from "drizzle-orm";
import db from "../db.js";
import { emailLogs } from "../schema/emailLogs.js";

export type EmailLogRecord = typeof emailLogs.$inferSelect;
export type EmailLogInsert = typeof emailLogs.$inferInsert;

export const emailLogsRepo = {
  async getAll(): Promise<EmailLogRecord[]> {
    return db.select().from(emailLogs).orderBy(desc(emailLogs.created_at));
  },

  async getById(id: string): Promise<EmailLogRecord | undefined> {
    const [record] = await db.select().from(emailLogs).where(eq(emailLogs.id, id));
    return record;
  },

  async getByContact(contactId: string): Promise<EmailLogRecord[]> {
    return db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.contact_id, contactId))
      .orderBy(desc(emailLogs.created_at));
  },

  async create(data: EmailLogInsert) {
    const [row] = await db
      .insert(emailLogs)
      .values({
        status: data.status ?? "logged",
        ...data,
      })
      .returning();

    return row;
  },
};

export default emailLogsRepo;
