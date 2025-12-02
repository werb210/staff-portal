import { pgTable, serial, timestamp, varchar, text } from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type").notNull(),
  userId: varchar("user_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});
