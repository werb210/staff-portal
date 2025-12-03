import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const smsQueue = pgTable("sms_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  contact_id: uuid("contact_id"),
  phone: text("phone").notNull(),
  body: text("body").notNull(),
  status: text("status").default("queued"),
  scheduled_at: timestamp("scheduled_at"),
  created_at: timestamp("created_at").defaultNow(),
});
