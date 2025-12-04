// server/src/services/messagesService.ts
import { messagesRepo } from "../db/repositories/messages.repo.js";
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
      senderId,
      recipientId,
      body,
      system,
    });

    // Notify recipient (if not system message)
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
    return await messagesRepo.thread(applicationId);
  },

  async inbox(userId: string) {
    return await messagesRepo.allForUser(userId);
  },
};
