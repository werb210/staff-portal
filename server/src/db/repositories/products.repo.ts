import db from "../db";
import { products } from "../schema/products";
import { eq } from "drizzle-orm";

export default {
  async findMany() {
    return await db.select().from(products);
  },

  async findById(id: string) {
    const rows = await db.select().from(products).where(eq(products.id, id));
    return rows[0] || null;
  },

  async create(data: any) {
    const rows = await db.insert(products).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: any) {
    const rows = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return rows[0];
  },

  async delete(id: string) {
    const rows = await db.delete(products).where(eq(products.id, id)).returning();
    return rows[0];
  }
};
