import db from "../db.js";
import { products } from "../schema/products.js";
import { eq } from "drizzle-orm";
import { safeDetails } from "../../utils/safeDetails.js";

export const productsRepo = {
  async create(data: any) {
    const [created] = await db.insert(products).values({
      lenderId: data.lenderId,
      name: data.name,
      type: data.type,
      minAmount: data.minAmount,
      maxAmount: data.maxAmount
    }).returning();
    return created;
  },

  async update(id: string, data: any) {
    const [updated] = await db.update(products)
      .set({
        lenderId: data.lenderId,
        name: data.name,
        type: data.type,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount
      })
      .where(eq(products.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [removed] = await db.delete(products)
      .where(eq(products.id, id))
      .returning();
    return removed;
  },

  async findById(id: string) {
    const [row] = await db.select().from(products).where(eq(products.id, id));
    return row || null;
  },

  async findMany(filter: any = {}) {
    const safeFilter = safeDetails(filter);

    if (safeFilter.lenderId) {
      return await db.select().from(products)
        .where(eq(products.lenderId, safeFilter.lenderId as string));
    }
    return await db.select().from(products);
  }
};

export default productsRepo;
