import timelineRepo from "../db/repositories/timeline.repo.js";

export const timelineService = {
  async record(
    _userId: string,
    _entity: string,
    entityId: string,
    eventType: string,
    message: string,
  ) {
    return timelineRepo.create({
      applicationId: entityId,
      type: eventType,
      description: message,
    });
  },

  async list(_entity: string, entityId: string) {
    return timelineRepo.listForApplication(entityId);
  },
};

export default timelineService;
