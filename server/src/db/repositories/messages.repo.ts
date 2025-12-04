// server/src/db/repositories/messages.repo.ts
import { db } from "../db.js";
import { messages } from "../schema/messages.js";
import { eq } from "drizzle-orm";

export const messagesRepo = {
  async create(data: {
    applicationId: string | null;
    senderId: string;
    recipientId: string | null;
    body: string;
    system: boolean;
  }) {
    const [row] = await db
      .insert(messages)
      .values({
        applicationId: data.applicationId,
        senderId: data.senderId,
        recipientId: data.recipientId,
        body: data.body,
        system: data.system,
      })
      .returning();
    return row;
  },

  async thread(applicationId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.applicationId, applicationId))
      .orderBy(messages.createdAt);
  },

  async allForUser(userId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.recipientId, userId))
      .orderBy(messages.createdAt);
  },
};
