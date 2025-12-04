import timelineRepo from "../db/repositories/timeline.repo.js";

export default {
  async list(contactId: string) {
    if (!contactId) throw new Error("contactId is required");
    return timelineRepo.getByContactId(contactId);
  },

  async add(contactId: string, eventType: string, description: string) {
    if (!contactId) throw new Error("contactId is required");
    if (!eventType) throw new Error("eventType is required");

    return timelineRepo.createEvent({
      contact_id: contactId,
      event_type: eventType,
      description,
    });
  },

  async record(
    userId: string,
    entityType: string,
    entityId: string,
    action: string,
    description?: string,
  ) {
    if (!userId) throw new Error("userId is required");
    if (!entityType) throw new Error("entityType is required");
    if (!entityId) throw new Error("entityId is required");
    if (!action) throw new Error("action is required");

    return timelineRepo.createEvent({
      contact_id: userId,
      event_type: `${entityType}:${action}`,
      description: description ?? `Resource ${entityId}`,
    });
  },
};
