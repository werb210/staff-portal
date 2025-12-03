import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  contact_id: uuid("contact_id"),
  direction: text("direction").$type<"inbound" | "outbound">().notNull(),
  channel: text("channel").$type<"sms" | "email" | "internal">().notNull(),
  body: text("body").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});
