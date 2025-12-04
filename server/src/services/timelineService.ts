// server/src/services/timelineService.ts
import { timelineRepo } from "../db/repositories/timeline.repo.js";
import type { TimelineRecord } from "../db/schema/timeline.js";

export const timelineService = {
  async record(
    userId: string,
    entity: string,
    entityId: string,
    eventType: string,
    message: string
  ): Promise<TimelineRecord> {
    return await timelineRepo.create({
      userId,
      entity,
      entityId,
      eventType,
      message,
    });
  },

  async list(entity: string, entityId: string): Promise<TimelineRecord[]> {
    return await timelineRepo.forEntity(entity, entityId);
  },
};
