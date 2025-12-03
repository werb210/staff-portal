import db from "../db.js";
import { auditLogs } from "../schema/audit.js";
import { and, eq } from "drizzle-orm";
import { safeDetails } from "../../utils/safeDetails.js";

const buildWhere = (filter: Record<string, unknown>) => {
  const clauses = [];

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
    const details = safeDetails(data?.details);
    const [created] = await db.insert(auditLogs)
      .values({
        eventType: data.eventType,
        details
      })
      .returning();
    return created;
  },

  async update(id: string, data: any) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const safeBase: Record<string, unknown> =
      existing && typeof existing.details === "object"
        ? existing.details
        : {};

    const incomingDetails =
      data && typeof data === "object" && "details" in data
        ? (data as any).details
        : data;

    const safeIncoming: Record<string, unknown> =
      incomingDetails && typeof incomingDetails === "object"
        ? incomingDetails
        : {};

    const merged = { ...safeBase, ...safeIncoming };

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
    const safeFilter = safeDetails(filter);
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
