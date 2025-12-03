import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sender_id: text("sender_id").notNull(),
  recipient_id: text("recipient_id").notNull(),
  body: text("body").notNull(),
  application_id: uuid("application_id"),
  contact_id: uuid("contact_id"),
  attachment_id: uuid("attachment_id"),
  read: boolean("read").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
