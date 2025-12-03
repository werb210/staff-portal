import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  contact_id: uuid("contact_id"),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  created_at: timestamp("created_at").defaultNow(),
});
