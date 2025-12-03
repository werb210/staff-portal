import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const emailLogs = pgTable("email_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  contact_id: uuid("contact_id"),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default("sent"),
  created_at: timestamp("created_at").defaultNow(),
});
