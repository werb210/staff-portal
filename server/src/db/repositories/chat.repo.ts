import { eq } from "drizzle-orm";
import db from "../db.js";
import { chatMessages } from "../schema/chatMessages.js";
import { conversations } from "../schema/conversations.js";

const chatRepo = {
  async createConversation(clientId: string, staffUserId: string) {
    const [row] = await db
      .insert(conversations)
      .values({
        clientId,
        staffUserId,
      })
      .returning();

    return row;
  },

  async getConversation(conversationId: string) {
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    return rows[0] ?? null;
  },

  async listConversations(clientId: string) {
    return db.select().from(conversations).where(eq(conversations.clientId, clientId));
  },

  async addMessage(conversationId: string, senderRole: string, text: string) {
    const [msg] = await db
      .insert(chatMessages)
      .values({
        conversationId,
        senderRole,
        text,
      })
      .returning();

    return msg;
  },

  async getMessages(conversationId: string) {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.timestamp);
  },
};

export default chatRepo;
