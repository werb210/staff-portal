import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  senderRole: text("sender_role").notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type ChatMessageRow = typeof chatMessages.$inferSelect;
