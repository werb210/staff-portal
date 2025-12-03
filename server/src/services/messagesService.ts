import { CreateMessage, messagesRepo } from "../db/repositories/messages.repo.js";

export const messagesService = {
  async list() {
    return messagesRepo.getAll();
  },

  async get(id: string) {
    return messagesRepo.getById(id);
  },

  async listByContact(contactId: string) {
    return messagesRepo.getByContact(contactId);
  },

  async create(payload: CreateMessage) {
    return messagesRepo.create(payload);
  },

  async remove(id: string) {
    return messagesRepo.delete(id);
  },
};
