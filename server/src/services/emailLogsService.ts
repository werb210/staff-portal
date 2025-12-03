import { emailLogsRepo } from "../db/repositories/emailLogs.repo.js";

export const emailLogsService = {
  async list() {
    return emailLogsRepo.getAll();
  },

  async get(id: string) {
    return emailLogsRepo.getById(id);
  },

  async listByContact(contactId: string) {
    return emailLogsRepo.getByContact(contactId);
  },

  async create(payload: any) {
    return emailLogsRepo.create(payload);
  },
};
