import db from "../db.js";
import { auditLogs, CreateAuditLog, AuditLogRecord } from "../schema/auditLogs.js";
import { eq } from "drizzle-orm";

export const auditLogsRepo = {
  async create(data: CreateAuditLog): Promise<AuditLogRecord> {
    const [inserted] = await db.insert(auditLogs).values(data).returning();
    return inserted;
  },

  async forEntity(entity: string, entityId: string): Promise<AuditLogRecord[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entity, entity))
      .where(eq(auditLogs.entityId, entityId));
  },

  async forUser(userId: string): Promise<AuditLogRecord[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId));
  },
};
