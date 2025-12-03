import db from "../db.js";
import { products } from "../schema/products.js";
import { eq, ilike } from "drizzle-orm";

export default {
  async findAll() {
    return db.select().from(products);
  },

  async search(query: string) {
    return db.select().from(products).where(ilike(products.name, `%${query}%`));
  },

  async findById(id: number) {
    const rows = await db.select().from(products).where(eq(products.id, id));
    return rows[0] || null;
  },

  async create(data: Omit<typeof products.$inferInsert, "id">) {
    const rows = await db.insert(products).values(data).returning();
    return rows[0];
  },

  async update(id: number, data: Partial<typeof products.$inferInsert>) {
    const rows = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return rows[0];
  }
};
