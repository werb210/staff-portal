import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey(),
  companyId: varchar("company_id"),
  email: varchar("email"),
  phone: varchar("phone"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});
