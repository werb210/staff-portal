import { smsLogsRepo } from "../db/repositories/smsLogs.repo.js";
import { smsQueueRepo } from "../db/repositories/smsQueue.repo.js";

/**
 * Basic SMS pipeline: log immediately and queue for delivery.
 * Twilio integration will be added in a later version.
 */
export const smsService = {
  async list() {
    return smsLogsRepo.getAll();
  },

  async get(id: string) {
    return smsLogsRepo.getById(id);
  },

  async listByContact(contactId: string) {
    return smsLogsRepo.getByContact(contactId);
  },

  /**
   * Queue + log an SMS
   */
  async send(payload: {
    contact_id?: string;
    to: string;
    message: string;
  }) {
    if (!payload.to || !payload.message) {
      throw new Error("to and message are required");
    }

    const queued = await smsQueueRepo.enqueue({
      contact_id: payload.contact_id ?? null,
      phone: payload.to,
      body: payload.message,
      status: "queued",
    });

    const logged = await smsLogsRepo.create({
      contact_id: payload.contact_id ?? null,
      phone: payload.to,
      body: payload.message,
      status: "queued",
    });

    return { queued, logged };
  },
};
