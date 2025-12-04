import timelineRepo from "../db/repositories/timeline.repo.js";
import { broadcastToUser } from "../realtime/wsServer.js";

export const timelineService = {
  async record(
    userId: string,
    entity: string,
    entityId: string,
    eventType: string,
    message: string,
  ) {
    const row = await timelineRepo.create({
      applicationId: entityId,
      type: eventType,
      description: message,
    });

    // If linked to an application, notify the assigned user
    if (entity === "applications" && userId) {
      broadcastToUser(userId, "timeline_event", row);
    }

    return row;
  },

  async list(_entity: string, entityId: string) {
    return timelineRepo.listForApplication(entityId);
  },
};

export default timelineService;
