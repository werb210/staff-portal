import { smsLogsRepo, type SmsLogInsert } from "../db/repositories/smsLogs.repo.js";

export const smsLogsService = {
  async list() {
    return smsLogsRepo.getAll();
  },

  async get(id: string) {
    return smsLogsRepo.getById(id);
  },

  async listByContact(contactId: string) {
    return smsLogsRepo.getByContact(contactId);
  },

  async create(payload: SmsLogInsert) {
    return smsLogsRepo.create(payload);
  },
};
