import { db } from "../db.js";
import { pipeline } from "../schema/pipeline.js";
import { eq } from "drizzle-orm";

export default {
  async findAll() {
    return db.select().from(pipeline);
  },

  async findByApplication(appId: number) {
    return db.select().from(pipeline).where(eq(pipeline.applicationId, appId));
  },

  async create(data: Omit<typeof pipeline.$inferInsert, "id">) {
    const rows = await db.insert(pipeline).values(data).returning();
    return rows[0];
  },

  async update(id: number, data: Partial<typeof pipeline.$inferInsert>) {
    const rows = await db.update(pipeline).set(data).where(eq(pipeline.id, id)).returning();
    return rows[0];
  }
};
