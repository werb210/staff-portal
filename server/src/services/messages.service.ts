import messagesRepo from "../db/repositories/messages.repo.js";
import timelineRepo from "../db/repositories/timeline.repo.js";

const messagesService = {
  async listForApplication(applicationId: string) {
    return messagesRepo.listForApplication(applicationId);
  },

  async listForContact(contactId: string) {
    return messagesRepo.listForContact(contactId);
  },

  async create(payload: any) {
    const message = await messagesRepo.create({
      applicationId: payload.applicationId ?? null,
      contactId: payload.contactId ?? null,
      userId: payload.userId ?? null,
      direction: payload.direction ?? "internal",
      channel: payload.channel ?? "note",
      body: payload.body ?? "",
    });

    // log timeline entry for visibility
    if (message.applicationId) {
      await timelineRepo.create({
        applicationId: message.applicationId,
        type: "message",
        description: `New ${message.channel} (${message.direction}) message added`,
      });
    }

    return message;
  },
};

export default messagesService;
