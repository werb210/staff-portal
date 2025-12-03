import db from "../db.js";
import { auditLogs } from "../schema/audit.js";
import { eq } from "drizzle-orm";

export const auditLogsRepo = {
  async create(data: any) {
    const [created] = await db.insert(auditLogs)
      .values({
        eventType: data.eventType,
        details: data.details ?? {}
      })
      .returning();
    return created;
  },

  async update(id: string, data: any) {
    const [updated] = await db.update(auditLogs)
      .set({
        details: data.details ?? {}
      })
      .where(eq(auditLogs.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [removed] = await db.delete(auditLogs)
      .where(eq(auditLogs.id, id))
      .returning();
    return removed;
  },

  async findById(id: string) {
    const [row] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    return row || null;
  },

  async findMany(filter: any = {}) {
    const rows = await db.select().from(auditLogs);
    if (!filter.eventType) return rows;
    return rows.filter(r => r.eventType === filter.eventType);
  }
};

export default auditLogsRepo;
