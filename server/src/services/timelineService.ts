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
};
