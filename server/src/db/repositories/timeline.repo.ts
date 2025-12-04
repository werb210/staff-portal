import db from "../db.js";

export interface TimelineRecord {
  id: string;
  applicationId: string;
  type: string;
  description: string;
  createdAt: Date;
}

const timelineRepo = {
  async listForApplication(appId: string): Promise<TimelineRecord[]> {
    return db
      .selectFrom("timeline")
      .selectAll()
      .where("applicationId", "=", appId)
      .orderBy("createdAt", "asc")
      .execute();
  },

  async forEntity(_entity: string, entityId: string): Promise<TimelineRecord[]> {
    return this.listForApplication(entityId);
  },

  async create(data: Partial<TimelineRecord>): Promise<TimelineRecord> {
    const row = await db
      .insertInto("timeline")
      .values({
        applicationId: data.applicationId!,
        type: data.type ?? "event",
        description: data.description ?? "",
      })
      .returningAll()
      .executeTakeFirst();

    return row as TimelineRecord;
  },
};

export { timelineRepo };
export default timelineRepo;
