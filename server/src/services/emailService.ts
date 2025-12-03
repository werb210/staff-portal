import { emailLogsRepo } from "../db/repositories/emailLogs.repo.js";

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
   * Simulated email send pipeline
   * In V3 this will call SendGrid / Office 365 / SMTP.
   */
  async send(payload: {
    contact_id?: string;
    email: string;
    subject: string;
    body: string;
  }) {
    // pretend sending succeeded
    const result = await emailLogsRepo.create({
      contact_id: payload.contact_id,
      email: payload.email,
      subject: payload.subject,
      body: payload.body,
      status: "sent",
    });

    return result;
  },
};
