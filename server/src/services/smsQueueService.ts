import { smsQueueRepo, type SmsQueueInsert } from "../db/repositories/smsQueue.repo.js";

export const smsQueueService = {
  async list() {
    return smsQueueRepo.getAll();
  },

  async get(id: string) {
    return smsQueueRepo.getById(id);
  },

  async enqueue(payload: SmsQueueInsert) {
    return smsQueueRepo.enqueue(payload);
  },

  async markSent(id: string) {
    return smsQueueRepo.updateStatus(id, "sent");
  },

  async markFailed(id: string) {
    return smsQueueRepo.updateStatus(id, "failed");
  },
};
