import messagesRepo, { MessageCreateInput } from "../db/repositories/messages.repo.js";

function assertStr(x: any, label: string): string {
  if (!x || typeof x !== "string") throw new Error(`${label} is required`);
  return x;
}

export default {
  async listForUser(userId: string) {
    return messagesRepo.listForUser(assertStr(userId, "userId"));
  },

  async listForApplication(applicationId: string) {
    return messagesRepo.listForApplication(assertStr(applicationId, "applicationId"));
  },

  async listForContact(contactId: string) {
    return messagesRepo.listForContact(assertStr(contactId, "contactId"));
  },

  async unreadCount(userId: string) {
    return messagesRepo.unreadCount(assertStr(userId, "userId"));
  },

  async markRead(id: string) {
    return messagesRepo.markRead(assertStr(id, "id"));
  },

  async markThreadRead(userId: string, contactId: string) {
    return messagesRepo.markThreadRead(assertStr(userId, "userId"), assertStr(contactId, "contactId"));
  },

  async create(raw: any) {
    const payload: MessageCreateInput = {
      senderId: assertStr(raw.senderId, "senderId"),
      recipientId: assertStr(raw.recipientId, "recipientId"),
      body: assertStr(raw.body, "body"),
      applicationId: raw.applicationId ?? null,
      contactId: raw.contactId ?? null,
      attachmentId: raw.attachmentId ?? null,
    };
    return messagesRepo.create(payload);
  },

  async delete(id: string) {
    return messagesRepo.delete(assertStr(id, "id"));
  },
};
