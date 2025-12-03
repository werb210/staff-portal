import { eq, and } from "drizzle-orm";
import { db } from "../db.js";
import { auditLogs } from "../schema/audit.js";

const safe = (v: any) => (v && typeof v === "object" ? v : {});

export const contactsRepo = {
  async create(data: Record<string, unknown>) {
    const [row] = await db
      .insert(auditLogs)
      .values({ eventType: "contact", details: safe(data) })
      .returning();
    return row;
  },

  async update(id: string, data: Record<string, unknown>) {
    const [existing] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    if (!existing || existing.eventType !== "contact") return null;

    const merged = { ...safe(existing.details), ...safe(data) };

    const [updated] = await db
      .update(auditLogs)
      .set({ details: merged })
      .where(eq(auditLogs.id, id))
      .returning();

    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db
      .delete(auditLogs)
      .where(eq(auditLogs.id, id))
      .returning();
    return deleted;
  },

  async findById(id: string) {
    const [record] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    if (!record || record.eventType !== "contact") return null;
    return record;
  },

  async findMany(filter: Record<string, unknown> = {}) {
    const conditions = Object.entries(filter)
      .filter(([, v]) => v !== undefined)
      .map(([key, v]) => eq((auditLogs as any)[key], v));

    const where =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

    const rows = await db.select().from(auditLogs).where(where);
    return rows.filter((r) => r.eventType === "contact");
  },
};

export default contactsRepo;
