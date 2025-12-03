import { desc, eq } from "drizzle-orm";
import { db } from "../db.js";
import { timeline } from "../schema/timeline.js";

export type TimelineRecord = typeof timeline.$inferSelect;
export type CreateTimelineEvent = typeof timeline.$inferInsert;

const timelineRepo = {
  async getByContactId(contactId: string): Promise<TimelineRecord[]> {
    return db
      .select()
      .from(timeline)
      .where(eq(timeline.contact_id, contactId))
      .orderBy(desc(timeline.created_at));
  },

  async createEvent(data: CreateTimelineEvent) {
    const [row] = await db.insert(timeline).values(data).returning();
    return row;
  },
};
export default timelineRepo;
