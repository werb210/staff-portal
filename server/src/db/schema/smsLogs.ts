import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const smsLogs = pgTable("sms_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  contact_id: uuid("contact_id"),
  company_id: uuid("company_id"),
  phone: text("phone"),
  body: text("body").notNull(),
  direction: text("direction").notNull().default("outgoing"),
  status: text("status").notNull().default("queued"),
  provider_message_id: text("provider_message_id"),
  error_message: text("error_message"),
  created_at: timestamp("created_at").defaultNow(),
});
