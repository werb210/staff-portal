import { smsLogsRepo } from "../db/repositories/smsLogs.repo.js";
import { smsQueueRepo } from "../db/repositories/smsQueue.repo.js";

/**
 * This service mirrors the server's SMS system.
 * Real Twilio integration will be plugged in during V3.
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
   * Simulate sending SMS
   * Real implementation in V3 will hit Twilio API.
   */
  async send(payload: {
    contact_id?: string;
    phone: string;
    message: string;
  }) {
    if (!payload.phone || !payload.message) {
      throw new Error("phone and message required");
    }

    const queued = await smsQueueRepo.enqueue({
      contact_id: payload.contact_id,
      phone: payload.phone,
      body: payload.message,
      status: "queued",
    });

    const sent = await smsLogsRepo.create({
      contact_id: payload.contact_id,
      phone: payload.phone,
      body: payload.message,
      status: "sent",
    });

    return { queued, sent };
  },
};
