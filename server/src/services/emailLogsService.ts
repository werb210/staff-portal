import { emailLogsRepo, type EmailLogInsert } from "../db/repositories/emailLogs.repo.js";

export const emailLogsService = {
  async list() {
    return emailLogsRepo.list();
  },

  async get(id: string) {
    return emailLogsRepo.getById(id);
  },

  async listByContact(contactId: string) {
    return emailLogsRepo.getByContact(contactId);
  },

  async listByCompany(companyId: string) {
    return emailLogsRepo.getByCompany(companyId);
  },

  async create(data: EmailLogInsert) {
    return emailLogsRepo.createLog(data);
  },
};

export default emailLogsService;
