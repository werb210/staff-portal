import { db } from "../db.js";
import { messages } from "../schema/messages.js";
import { eq, and } from "drizzle-orm";

export const chatRepo = {
  async create(data: any) {
    const [row] = await db.insert(messages).values(data).returning();
    return row;
  },

  async getConversation(userA: string, userB: string) {
    return db.select()
      .from(messages)
      .where(
        and(
          eq(messages.threadType, "direct"),
          and(
            eq(messages.userA, userA),
            eq(messages.userB, userB)
          )
        )
      )
      .orderBy(messages.createdAt);
  },
};

export default chatRepo;
