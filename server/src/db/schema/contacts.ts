import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company_id: uuid("company_id"),
  created_at: timestamp("created_at").defaultNow(),
});
