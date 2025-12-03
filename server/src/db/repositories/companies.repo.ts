import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { companies } from "../schema/companies.js";

export type CompanyInsert = typeof companies.$inferInsert;
export type Company = typeof companies.$inferSelect;

const normalizeId = (id: string | number) => Number(id);

export const companiesRepo = {
  async findMany(): Promise<Company[]> {
    return db.select().from(companies);
  },

  async findById(id: string): Promise<Company | null> {
    const [record] = await db.select().from(companies).where(eq(companies.id, normalizeId(id)));
    return record || null;
  },

  async create(data: CompanyInsert): Promise<Company | null> {
    const [record] = await db.insert(companies).values(data).returning();
    return record || null;
  },

  async update(id: string, data: Partial<CompanyInsert>): Promise<Company | null> {
    const [record] = await db
      .update(companies)
      .set(data)
      .where(eq(companies.id, normalizeId(id)))
      .returning();

    return record || null;
  },

  async delete(id: string): Promise<Company | null> {
    const [record] = await db.delete(companies).where(eq(companies.id, normalizeId(id))).returning();
    return record || null;
  }
};

export default companiesRepo;
