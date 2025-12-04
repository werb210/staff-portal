// server/src/services/messagesService.ts
import { messagesRepo } from "../db/repositories/messages.repo.js";

export const messagesService = {
  async send({
    threadId,
    senderId,
    receiverId,
    body,
  }: {
    threadId: string;
    senderId: string;
    receiverId: string | null;
    body: string;
  }) {
    return await messagesRepo.create({
      threadId,
      senderId,
      receiverId,
      direction: "outbound",
      body,
    });
  },

  async receive({
    threadId,
    senderId,
    receiverId,
    body,
  }: {
    threadId: string;
    senderId: string;
    receiverId: string | null;
    body: string;
  }) {
    return await messagesRepo.create({
      threadId,
      senderId,
      receiverId,
      direction: "inbound",
      body,
    });
  },

  async thread(threadId: string) {
    return await messagesRepo.getThread(threadId);
  },
};
