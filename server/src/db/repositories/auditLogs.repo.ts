import db from "../db.js";
import { auditLogs } from "../schema/audit.js";
import { and, eq } from "drizzle-orm";
import { safeDetails } from "../../utils/safeDetails.js";

const buildWhere = (filter: Record<string, any>) => {
  const clauses = [] as any[];

  if (typeof filter.eventType === "string") {
    clauses.push(eq(auditLogs.eventType, filter.eventType));
  }

  if (typeof filter.userId === "string") {
    clauses.push(eq(auditLogs.userId, filter.userId));
  }

  return clauses.length ? and(...clauses) : undefined;
};

const mapRecord = (record: any) => record || null;

export const auditLogsRepo = {
  async create(data: any) {
    const details = safeDetails((data as any)?.details);
    const [created] = await db.insert(auditLogs)
      .values({
        eventType: (data as any).eventType,
        details
      })
      .returning();
    return created;
  },

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const base = safeDetails(existing.details as Record<string, any>);

    const incomingDetails =
      data && typeof data === "object" && "details" in data
        ? (data as any).details
        : data;

    const patch = safeDetails(incomingDetails as Record<string, any>);

    const merged = { ...base, ...patch };

    const [updated] = await db.update(auditLogs)
      .set({
        details: merged
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
    const safeFilter = safeDetails(filter as Record<string, any>);
    const where = buildWhere({ ...safeFilter });
    const results = await db.select().from(auditLogs).where(where);

    return results
      .filter(r =>
        typeof safeFilter.eventType === "string"
          ? r.eventType === safeFilter.eventType
          : true
      )
      .map(mapRecord)
      .filter(Boolean);
  }
};

export default auditLogsRepo;
