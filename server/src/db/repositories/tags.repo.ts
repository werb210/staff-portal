import db from "../db.js";
import { tags } from "../schema/tags.js";
import { eq } from "drizzle-orm";

export type TagRecord = typeof tags.$inferSelect;
export type CreateTag = typeof tags.$inferInsert;

export const tagsRepo = {
  async getAll(): Promise<TagRecord[]> {
    return db.select().from(tags);
  },

  async getById(id: string): Promise<TagRecord | undefined> {
    const row = await db.select().from(tags).where(eq(tags.id, id));
    return row[0];
  },

  async create(data: CreateTag): Promise<TagRecord> {
    const [row] = await db.insert(tags).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<CreateTag>): Promise<TagRecord> {
    const [row] = await db
      .update(tags)
      .set(data)
      .where(eq(tags.id, id))
      .returning();
    return row;
  }
};
