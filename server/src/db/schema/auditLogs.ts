import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(),
  entity: varchar("entity").notNull(),
  entityId: varchar("entity_id").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AuditLogRecord = typeof auditLogs.$inferSelect;
export type CreateAuditLog = typeof auditLogs.$inferInsert;
