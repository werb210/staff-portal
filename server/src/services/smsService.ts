import { smsLogsRepo } from "../db/repositories/smsLogs.repo.js";

/**
 * Simplified SMS pipeline (logging only).
 * Real Twilio integration comes later in its own block.
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
   * Log an SMS (sending comes in a later dedicated block)
   */
  async send(payload: {
    to: string;
    body: string;
    contact_id?: string;
  }) {
    if (!payload.to || !payload.body) {
      throw new Error("to and body are required");
    }

    const logged = await smsLogsRepo.create({
      phone: payload.to,
      body: payload.body,
      contact_id: payload.contact_id ?? null,
      status: "logged",
    });

    return { logged };
  },
};
