// server/src/db/schema/messages.ts
import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id"),
  senderId: uuid("sender_id").notNull(),
  recipientId: uuid("recipient_id"),
  body: text("body").notNull(),
  system: boolean("system").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
