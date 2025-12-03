import { desc, eq } from "drizzle-orm";
import { db } from "../db.js";
import { messages } from "../schema/messages.js";

export type MessageRecord = typeof messages.$inferSelect;

export interface MessageCreateInput {
  contactId?: string | null;
  companyId?: string | null;
  createdByUserId: string;
  body: string;
  pinned?: boolean;
}

const messagesRepo = {
  async list(): Promise<MessageRecord[]> {
    return db.select().from(messages).orderBy(desc(messages.created_at));
  },

  async getById(id: string): Promise<MessageRecord | undefined> {
    const [record] = await db.select().from(messages).where(eq(messages.id, id));
    return record;
  },

  async listByContact(contactId: string): Promise<MessageRecord[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.contact_id, contactId))
      .orderBy(desc(messages.created_at));
  },

  async listByCompany(companyId: string): Promise<MessageRecord[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.company_id, companyId))
      .orderBy(desc(messages.created_at));
  },

  async create(data: MessageCreateInput) {
    const [row] = await db
      .insert(messages)
      .values({
        contact_id: data.contactId ?? null,
        company_id: data.companyId ?? null,
        created_by_user_id: data.createdByUserId,
        body: data.body,
        pinned: data.pinned ?? false,
      })
      .returning();
    return row;
  },

  async pin(id: string) {
    const [row] = await db.update(messages).set({ pinned: true }).where(eq(messages.id, id)).returning();
    return row;
  },

  async unpin(id: string) {
    const [row] = await db.update(messages).set({ pinned: false }).where(eq(messages.id, id)).returning();
    return row;
  },
};

export default messagesRepo;
