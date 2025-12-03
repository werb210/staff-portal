import emailLogsRepo from "../db/repositories/emailLogs.repo.js";

/**
 * Simplified email pipeline (logging only).
 * SendGrid / Office365 integration comes later in a dedicated block.
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
   * Log an email (send functionality arrives in later block)
   */
  async send(payload: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    contact_id?: string;
  }) {
    if (!payload.to || !payload.subject) {
      throw new Error("to and subject are required");
    }

    const logged = await emailLogsRepo.create({
      email: payload.to,
      subject: payload.subject,
      html: payload.html ?? null,
      text: payload.text ?? null,
      body: payload.text ?? payload.html ?? "",
      contact_id: payload.contact_id ?? null,
      status: "logged",
    });

    return { logged };
  },
};
