import db from "../db.js";
import { and, eq } from "drizzle-orm";
import { auditLogs } from "../schema/audit.js";

type Filter = Record<string, unknown>;

const buildWhere = (filter: Filter = {}) => {
  const conditions = Object.entries(filter)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => eq((auditLogs as any)[key], value as any));

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
};

const safeDetails = (value: any): Record<string, unknown> => {
  return value && typeof value === "object" ? value : {};
};

const mapRecord = (record: any) => {
  if (!record) return null;

  const details = safeDetails(record.details);

  return {
    id: record.id,
    ...details,
    createdAt: record.createdAt,
  };
};

const contactsRepo = {
  async create(data: Record<string, unknown>) {
    const [created] = await db
      .insert(auditLogs)
      .values({
        eventType: "contact",
        details: safeDetails(data),
      })
      .returning();

    return mapRecord(created);
  },

  async update(id: string, data: Record<string, unknown>) {
    const [existing] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id));

    if (!existing || existing.eventType !== "contact") return null;

    const merged = {
      ...safeDetails(existing.details),
      ...safeDetails(data),
    };

    const [updated] = await db
      .update(auditLogs)
      .set({ details: merged })
      .where(eq(auditLogs.id, id))
      .returning();

    return mapRecord(updated);
  },

  async delete(id: string) {
    const [deleted] = await db
      .delete(auditLogs)
      .where(eq(auditLogs.id, id))
      .returning();

    return mapRecord(deleted);
  },

  async findById(id: string) {
    const [record] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id));

    if (!record || record.eventType !== "contact") return null;

    return mapRecord(record);
  },

  async findMany(filter: Filter = {}) {
    const where = buildWhere({
      ...filter,
      eventType: "contact",
    });

    let query = db.select().from(auditLogs);
    if (where) {
      query = query.where(where);
    }

    const results = await query;

    return results
      .filter((r) => r.eventType === "contact")
      .map(mapRecord)
      .filter(Boolean);
  },
};

export default contactsRepo;
