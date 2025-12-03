import { desc, eq } from "drizzle-orm";
import db from "../db.js";
import { contacts } from "../schema/contacts.js";
import { emailLogs } from "../schema/emailLogs.js";

export type EmailLogRecord = typeof emailLogs.$inferSelect;
export type EmailLogInsert = typeof emailLogs.$inferInsert;

type EmailLogWithContact = {
  email_logs: EmailLogRecord;
  contacts: typeof contacts.$inferSelect;
};

export const emailLogsRepo = {
  async list(): Promise<EmailLogRecord[]> {
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

  async getByCompany(companyId: string): Promise<EmailLogRecord[]> {
    const rows = await db
      .select()
      .from(emailLogs)
      .innerJoin(contacts, eq(emailLogs.contact_id, contacts.id))
      .where(eq(contacts.company_id, companyId))
      .orderBy(desc(emailLogs.created_at));

    return rows.map((row: EmailLogWithContact) => row.email_logs);
  },

  async createLog(data: EmailLogInsert) {
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
