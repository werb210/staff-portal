import db from "../db.js";
import { companies } from "../schema/companies.js";
import { eq } from "drizzle-orm";

export const companiesRepo = {
  async create(data: any) {
    const [created] = await db.insert(companies).values({
      name: data.name,
      website: data.website,
      address: data.address
    }).returning();
    return created;
  },

  async update(id: string, data: any) {
    const [updated] = await db.update(companies)
      .set({
        name: data.name,
        website: data.website,
        address: data.address
      })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [removed] = await db.delete(companies)
      .where(eq(companies.id, id))
      .returning();
    return removed;
  },

  async findById(id: string) {
    const [row] = await db.select().from(companies).where(eq(companies.id, id));
    return row || null;
  },

  async findMany() {
    return await db.select().from(companies);
  }
};

export default companiesRepo;
