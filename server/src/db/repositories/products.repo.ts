import db from "../db.js";
import { eq } from "drizzle-orm";
import * as products from "../schema/products.js";

export type ProductRecord = typeof products.$inferSelect;
export type CreateProduct = typeof products.$inferInsert;

export const productsRepo = {
  async getAll(): Promise<ProductRecord[]> {
    return db.select().from(products);
  },

  async getById(id: string): Promise<ProductRecord | undefined> {
    const [row] = await db.select().from(products).where(eq(products.id, id));
    return row;
  },

  async create(data: CreateProduct) {
    const [row] = await db.insert(products).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<CreateProduct>) {
    const [row] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return row;
  },
};
