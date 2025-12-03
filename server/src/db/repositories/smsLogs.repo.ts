import { desc, eq } from "drizzle-orm";
import db from "../db.js";
import { smsLogs } from "../schema/smsLogs.js";

export type SmsLogRecord = typeof smsLogs.$inferSelect;

export type SmsDirection = "incoming" | "outgoing";
export type SmsStatus = "queued" | "sent" | "delivered" | "failed";

export interface SmsLogCreateInput {
  contactId?: string | null;
  companyId?: string | null;
  phone?: string | null;
  body: string;
  direction: SmsDirection;
  status: SmsStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
}

export const smsLogsRepo = {
  async list(): Promise<SmsLogRecord[]> {
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

  async getByCompany(companyId: string): Promise<SmsLogRecord[]> {
    return db
      .select()
      .from(smsLogs)
      .where(eq(smsLogs.company_id, companyId))
      .orderBy(desc(smsLogs.created_at));
  },

  async getByPhone(phone: string): Promise<SmsLogRecord[]> {
    return db
      .select()
      .from(smsLogs)
      .where(eq(smsLogs.phone, phone))
      .orderBy(desc(smsLogs.created_at));
  },

  async createLog(data: SmsLogCreateInput) {
    const [row] = await db
      .insert(smsLogs)
      .values({
        contact_id: data.contactId ?? null,
        company_id: data.companyId ?? null,
        phone: data.phone ?? null,
        body: data.body,
        direction: data.direction,
        status: data.status,
        provider_message_id: data.providerMessageId ?? null,
        error_message: data.errorMessage ?? null,
      })
      .returning();

    return row;
  },
};

export default smsLogsRepo;
