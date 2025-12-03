import { and, asc, count, desc, eq, or } from "drizzle-orm";
import db from "../db.js";
import { messages } from "../schema/messages.js";

export interface MessageCreateInput {
  senderId: string;
  recipientId: string;
  body: string;
  applicationId?: string | null;
  contactId?: string | null;
  attachmentId?: string | null; // references documents/attachments
}

const messagesRepo = {
  async listForUser(userId: string) {
    return db
      .select()
      .from(messages)
      .where(or(eq(messages.sender_id, userId), eq(messages.recipient_id, userId)))
      .orderBy(desc(messages.created_at));
  },

  async listForApplication(applicationId: string) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.application_id, applicationId))
      .orderBy(asc(messages.created_at));
  },

  async listForContact(contactId: string) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.contact_id, contactId))
      .orderBy(asc(messages.created_at));
  },

  async unreadCount(userId: string) {
    const [row] = await db
      .select({ count: count() })
      .from(messages)
      .where(and(eq(messages.recipient_id, userId), eq(messages.read, false)));
    return Number(row?.count ?? 0);
  },

  async markRead(id: string) {
    const [row] = await db.update(messages).set({ read: true }).where(eq(messages.id, id)).returning();
    return row;
  },

  async markThreadRead(userId: string, contactId: string) {
    return db
      .update(messages)
      .set({ read: true })
      .where(and(eq(messages.recipient_id, userId), eq(messages.contact_id, contactId), eq(messages.read, false)))
      .returning();
  },

  async create(data: MessageCreateInput) {
    const [row] = await db
      .insert(messages)
      .values({
        sender_id: data.senderId,
        recipient_id: data.recipientId,
        body: data.body,
        application_id: data.applicationId ?? null,
        contact_id: data.contactId ?? null,
        attachment_id: data.attachmentId ?? null,
      })
      .returning();
    return row;
  },

  async delete(id: string) {
    const [row] = await db.delete(messages).where(eq(messages.id, id)).returning();
    return row;
  },
};

export default messagesRepo;
