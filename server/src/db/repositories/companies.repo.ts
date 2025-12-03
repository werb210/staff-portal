// server/src/db/repositories/companies.repo.ts
import db from "../db";
import { eq } from "drizzle-orm";
import { companies } from "../schema/companies";

export interface CompanyCreateInput {
  name: string;
  website?: string | null;
  phone?: string | null;
}

export const CompaniesRepo = {
  async create(data: CompanyCreateInput) {
    const [record] = await db.insert(companies).values(data).returning();
    return record || null;
  },

  async findById(id: string) {
    const [record] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id));
    return record || null;
  },

  async findAll() {
    return await db.select().from(companies);
  },

  async update(id: string, data: Partial<CompanyCreateInput>) {
    const [record] = await db
      .update(companies)
      .set(data)
      .where(eq(companies.id, id))
      .returning();
    return record || null;
  },

  async remove(id: string) {
    const [record] = await db
      .delete(companies)
      .where(eq(companies.id, id))
      .returning();
    return record || null;
  },
};

export default CompaniesRepo;
