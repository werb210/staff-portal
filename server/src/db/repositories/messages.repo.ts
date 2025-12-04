import db from "../db.js";

export interface MessageRecord {
  id: string;
  applicationId: string | null;
  contactId: string | null;
  userId: string | null;
  direction: "inbound" | "outbound" | "internal";
  channel: "email" | "sms" | "call" | "note";
  body: string;
  createdAt: Date;
}

const messagesRepo = {
  async listForApplication(appId: string): Promise<MessageRecord[]> {
    return db
      .selectFrom("messages")
      .selectAll()
      .where("applicationId", "=", appId)
      .orderBy("createdAt", "asc")
      .execute();
  },

  async listForContact(contactId: string): Promise<MessageRecord[]> {
    return db
      .selectFrom("messages")
      .selectAll()
      .where("contactId", "=", contactId)
      .orderBy("createdAt", "asc")
      .execute();
  },

  async create(data: Partial<MessageRecord>): Promise<MessageRecord> {
    const row = await db
      .insertInto("messages")
      .values({
        applicationId: data.applicationId ?? null,
        contactId: data.contactId ?? null,
        userId: data.userId ?? null,
        direction: data.direction ?? "internal",
        channel: data.channel ?? "note",
        body: data.body ?? "",
      })
      .returningAll()
      .executeTakeFirst();

    return row as MessageRecord;
  },
};

export { messagesRepo };
export default messagesRepo;
