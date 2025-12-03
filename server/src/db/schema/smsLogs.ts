import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const smsLogs = pgTable("sms_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  contact_id: uuid("contact_id"),
  phone: text("phone").notNull(),
  body: text("body").notNull(),
  status: text("status").default("sent"),
  created_at: timestamp("created_at").defaultNow(),
});
