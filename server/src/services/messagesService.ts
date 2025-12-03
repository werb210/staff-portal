import messagesRepo, { MessageCreateInput } from "../db/repositories/messages.repo.js";

function assertString(value: unknown, label: string) {
  if (!value || typeof value !== "string") {
    throw new Error(`${label} is required`);
  }
  return value;
}

export default {
  async list() {
    return messagesRepo.list();
  },

  async get(id: string) {
    const safeId = assertString(id, "id");
    const record = await messagesRepo.getById(safeId);
    if (!record) throw new Error("Message not found");
    return record;
  },

  async listByContact(contactId: string) {
    return messagesRepo.listByContact(assertString(contactId, "contactId"));
  },

  async listByCompany(companyId: string) {
    return messagesRepo.listByCompany(assertString(companyId, "companyId"));
  },

  async create(raw: any) {
    const payload: MessageCreateInput = {
      contactId: raw.contactId ?? null,
      companyId: raw.companyId ?? null,
      createdByUserId: assertString(raw.createdByUserId, "createdByUserId"),
      body: assertString(raw.body, "body"),
      pinned: raw.pinned ?? false,
    };

    return messagesRepo.create(payload);
  },

  async pin(id: string) {
    return messagesRepo.pin(assertString(id, "id"));
  },

  async unpin(id: string) {
    return messagesRepo.unpin(assertString(id, "id"));
  },
};
