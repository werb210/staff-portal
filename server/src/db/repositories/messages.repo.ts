import { and, eq } from "drizzle-orm";
import { db } from "../db.js";
import { messages } from "../schema/messages.js";

export const messagesRepo = {
  async send({ threadId, senderId, recipientId, body }: any) {
    const [m] = await db
      .insert(messages)
      .values({
        threadId,
        senderId,
        recipientId,
        body,
      })
      .returning();
    return m;
  },

  async threadMessages(threadId: string) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(messages.createdAt);
  },

  async inboxFor(userId: string) {
    return db
      .select()
      .from(messages)
      .where(and(eq(messages.recipientId, userId)))
      .orderBy(messages.createdAt);
  },
};
