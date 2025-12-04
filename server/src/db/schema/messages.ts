import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  threadId: text("thread_id").notNull(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id"),
  direction: text("direction").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
