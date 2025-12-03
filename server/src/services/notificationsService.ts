import { notificationsRepo } from "../db/repositories/notifications.repo.js";

export const notificationsService = {
  async list() {
    return notificationsRepo.getAll();
  },

  async get(id: string) {
    return notificationsRepo.getById(id);
  },

  async listByContact(contactId: string) {
    return notificationsRepo.getByContact(contactId);
  },

  async create(payload: any) {
    return notificationsRepo.create(payload);
  },

  async markRead(id: string) {
    return notificationsRepo.markRead(id);
  },

  async remove(id: string) {
    return notificationsRepo.delete(id);
  },
};
