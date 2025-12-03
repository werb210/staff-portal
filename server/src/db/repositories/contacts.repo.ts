// server/src/db/repositories/contacts.repo.ts
import { and, eq } from "drizzle-orm";
import db from "../db.js";
import { auditLogs } from "../schema/audit.js";

// Narrow JSON value to a safe object
const safeDetails = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
};

// Build a dynamic WHERE clause from a simple filter object
const buildWhere = (filter: Record<string, unknown> = {}) => {
  const conditions = Object.entries(filter)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      // We cast to any so we can index auditLogs dynamically without
      // fighting the type system.
      const column = (auditLogs as any)[key];
      if (!column) return null;
      return eq(column, value as any);
    })
    .filter(Boolean) as any[];

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];

  return and(...conditions);
};

type ContactFilter = Record<string, unknown>;
type ContactDetails = Record<string, unknown>;

// Normalize a raw auditLogs record into a contact object
const mapRecord = (record: any) => {
  if (!record || record.eventType !== "contact") return null;

  const details = safeDetails(record.details);

  return {
    id: record.id as string,
    name: (details.name as string) ?? "",
    email: (details.email as string) ?? "",
    phone: (details.phone as string) ?? "",
    company: (details.company as string) ?? "",
    details,
    createdAt: record.createdAt,
  };
};

export const contactsRepo = {
  async create(details: ContactDetails) {
    const [inserted] = await db
      .insert(auditLogs)
      .values({
        eventType: "contact",
        details,
      })
      .returning();

    return mapRecord(inserted);
  },

  async update(id: string, details: ContactDetails) {
    const [updated] = await db
      .update(auditLogs)
      .set({ details })
      .where(eq(auditLogs.id, id as any))
      .returning();

    return mapRecord(updated);
  },

  async delete(id: string) {
    const [deleted] = await db
      .delete(auditLogs)
      .where(eq(auditLogs.id, id as any))
      .returning();

    return mapRecord(deleted);
  },

  async findById(id: string) {
    const [record] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id as any));

    return mapRecord(record);
  },

  async findMany(filter: ContactFilter = {}) {
    const where = buildWhere({
      ...filter,
      eventType: "contact",
    });

    const query = db.select().from(auditLogs);
    const rows = where ? await query.where(where) : await query;

    return rows.map(mapRecord).filter(Boolean);
  },
};

export default contactsRepo;
