import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  eventType: text("event_type").notNull(),
  userId: uuid("user_id"),
  details: jsonb("details").$type<Record<string, unknown>>().default({}),

  createdAt: timestamp("created_at").defaultNow(),
});
