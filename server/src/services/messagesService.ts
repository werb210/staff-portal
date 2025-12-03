import { messagesRepo } from "../db/repositories/messages.repo.js";

function assertStr(x: any, label: string): string {
  if (!x || typeof x !== "string") throw new Error(`${label} is required`);
  return x;
}

export default {
  async send(raw: any) {
    const payload = {
      threadId: assertStr(raw.threadId, "threadId"),
      senderId: assertStr(raw.senderId, "senderId"),
      recipientId: assertStr(raw.recipientId, "recipientId"),
      body: assertStr(raw.body, "body"),
    };
    return messagesRepo.send(payload);
  },

  async thread(threadId: string) {
    return messagesRepo.threadMessages(assertStr(threadId, "threadId"));
  },

  async inbox(userId: string) {
    return messagesRepo.inboxFor(assertStr(userId, "userId"));
  },
};
