import { emailLogsRepo } from "../db/repositories/emailLogs.repo.js";

/**
 * Basic email pipeline:
 * - logs outbound emails
 * - returns history
 * Full SMTP integration added in later blocks.
 */
export const emailService = {
  async list() {
    return emailLogsRepo.getAll();
  },

  async get(id: string) {
    return emailLogsRepo.getById(id);
  },

  async listByContact(contactId: string) {
    return emailLogsRepo.getByContact(contactId);
  },

  /**
   * Simulate sending an email
   */
  async send(payload: {
    contact_id?: string;
    to: string;
    subject: string;
    body: string;
  }) {
    if (!payload.to || !payload.subject || !payload.body)
      throw new Error("to, subject, and body are required");

    // Log it
    const saved = await emailLogsRepo.create({
      contact_id: payload.contact_id,
      email: payload.to,
      subject: payload.subject,
      body: payload.body,
      status: "sent",
    });

    return saved;
  },
};
