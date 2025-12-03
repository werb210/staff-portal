import { desc, eq } from "drizzle-orm";
import { db } from "../db.js";
import { messages } from "../schema/messages.js";

export type MessageRecord = typeof messages.$inferSelect;
export type CreateMessage = typeof messages.$inferInsert;

export const messagesRepo = {
  async getAll(): Promise<MessageRecord[]> {
    return db.select().from(messages).orderBy(desc(messages.created_at));
  },

  async getById(id: string): Promise<MessageRecord | undefined> {
    const [record] = await db.select().from(messages).where(eq(messages.id, id));
    return record;
  },

  async getByContact(contactId: string): Promise<MessageRecord[]> {
    return db.select().from(messages).where(eq(messages.contact_id, contactId)).orderBy(desc(messages.created_at));
  },

  async create(data: CreateMessage) {
    const [row] = await db.insert(messages).values(data).returning();
    return row;
  },

  async delete(id: string) {
    return db.delete(messages).where(eq(messages.id, id)).execute();
  },
};
