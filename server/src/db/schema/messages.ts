import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  contact_id: uuid("contact_id"),
  company_id: uuid("company_id"),
  created_by_user_id: text("created_by_user_id").notNull(),
  body: text("body").notNull(),
  pinned: boolean("pinned").default(false),
  created_at: timestamp("created_at").defaultNow(),
});
