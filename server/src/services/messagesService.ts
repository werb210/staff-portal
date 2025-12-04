import messagesRepo from "../db/repositories/messages.repo.js";
import { notificationsService } from "./notificationsService.js";

export const messagesService = {
  async send({
    applicationId,
    senderId,
    recipientId,
    body,
    system = false,
  }: {
    applicationId: string | null;
    senderId: string;
    recipientId: string | null;
    body: string;
    system?: boolean;
  }) {
    const msg = await messagesRepo.create({
      applicationId,
      contactId: recipientId,
      userId: senderId,
      direction: system ? "internal" : "outbound",
      channel: "note",
      body,
    });

    if (recipientId && !system) {
      await notificationsService.create({
        userId: recipientId,
        title: "New Message",
        message: body.slice(0, 200),
        category: "message",
      });
    }

    return msg;
  },

  async thread(applicationId: string) {
    return messagesRepo.listForApplication(applicationId);
  },

  async inbox(contactId: string) {
    return messagesRepo.listForContact(contactId);
  },
};
