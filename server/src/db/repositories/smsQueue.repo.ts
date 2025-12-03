import { desc, eq } from "drizzle-orm";
import db from "../db.js";
import { smsQueue } from "../schema/smsQueue.js";

export type SmsQueueRecord = typeof smsQueue.$inferSelect;
export type SmsQueueInsert = typeof smsQueue.$inferInsert;

export const smsQueueRepo = {
  async getAll(): Promise<SmsQueueRecord[]> {
    return db.select().from(smsQueue).orderBy(desc(smsQueue.created_at));
  },

  async getById(id: string): Promise<SmsQueueRecord | undefined> {
    const [record] = await db.select().from(smsQueue).where(eq(smsQueue.id, id));
    return record;
  },

  async enqueue(data: SmsQueueInsert) {
    const [row] = await db
      .insert(smsQueue)
      .values({
        status: data.status ?? "queued",
        scheduled_at: data.scheduled_at ?? null,
        ...data,
      })
      .returning();

    return row;
  },

  async updateStatus(id: string, status: string) {
    const [row] = await db
      .update(smsQueue)
      .set({ status })
      .where(eq(smsQueue.id, id))
      .returning();

    return row;
  },
};
