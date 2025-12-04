// server/src/db/schema/messages.ts
import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadType: text("thread_type"),
  userA: text("user_a"),
  userB: text("user_b"),
  fromUserId: text("from_user_id"),
  toUserId: text("to_user_id"),
  applicationId: uuid("application_id"),
  senderId: uuid("sender_id"),
  recipientId: uuid("recipient_id"),
  body: text("body").notNull(),
  system: boolean("system").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
