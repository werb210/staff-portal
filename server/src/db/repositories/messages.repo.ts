// server/src/db/repositories/messages.repo.ts
import { db } from "../db.js";
import { messages } from "../schema/messages.js";
import { eq } from "drizzle-orm";

export const messagesRepo = {
  async create(data: {
    threadId: string;
    senderId: string;
    receiverId: string | null;
    direction: "inbound" | "outbound";
    body: string;
  }) {
    const [row] = await db.insert(messages).values({
      threadId: data.threadId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      direction: data.direction,
      body: data.body,
    }).returning();
    return row;
  },

  async getThread(threadId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(messages.createdAt);
  },

  async getAllForContact(contactId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.receiverId, contactId));
  },
};
