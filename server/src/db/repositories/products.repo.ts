import db from "../db.js";
import { products } from "../schema/products.js";
import { eq } from "drizzle-orm";

export type ProductRecord = typeof products.$inferSelect;
export type CreateProduct = typeof products.$inferInsert;

export const productsRepo = {
  async getAll(): Promise<ProductRecord[]> {
    return db.select().from(products);
  },

  async getById(id: string): Promise<ProductRecord | undefined> {
    const row = await db.select().from(products).where(eq(products.id, id));
    return row[0];
  },

  async create(data: CreateProduct): Promise<ProductRecord> {
    const [row] = await db.insert(products).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<CreateProduct>): Promise<ProductRecord> {
    const [row] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return row;
  }
};
