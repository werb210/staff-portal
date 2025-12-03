import smsLogsRepo, {
  type SmsLogCreateInput,
  type SmsDirection,
  type SmsStatus,
} from "../db/repositories/smsLogs.repo.js";

function assertString(value: unknown, field: string): string {
  if (!value || typeof value !== "string") {
    throw new Error(`${field} is required`);
  }
  return value;
}

function assertDirection(value: unknown): SmsDirection {
  if (value !== "incoming" && value !== "outgoing") {
    throw new Error("direction must be 'incoming' or 'outgoing'");
  }
  return value;
}

function assertStatus(value: unknown): SmsStatus {
  const allowed: SmsStatus[] = ["queued", "sent", "delivered", "failed"];
  if (!allowed.includes(value as SmsStatus)) {
    throw new Error(`status must be one of: ${allowed.join(", ")}`);
  }
  return value as SmsStatus;
}

const smsLogsService = {
  async list() {
    return smsLogsRepo.list();
  },

  async get(id: string) {
    const safeId = assertString(id, "id");
    const log = await smsLogsRepo.getById(safeId);
    if (!log) throw new Error("SMS log not found");
    return log;
  },

  async listByContact(contactId: string) {
    const safeId = assertString(contactId, "contactId");
    return smsLogsRepo.getByContact(safeId);
  },

  async listByCompany(companyId: string) {
    const safeId = assertString(companyId, "companyId");
    return smsLogsRepo.getByCompany(safeId);
  },

  async listByPhone(phone: string) {
    const safePhone = assertString(phone, "phone");
    return smsLogsRepo.getByPhone(safePhone);
  },

  async create(raw: Record<string, unknown>) {
    const payload: SmsLogCreateInput = {
      contactId: (raw.contactId as string | undefined) ?? null,
      companyId: (raw.companyId as string | undefined) ?? null,
      phone: (raw.phone as string | undefined) ?? null,
      body: assertString(raw.body, "body"),
      direction: assertDirection(raw.direction),
      status: assertStatus(raw.status),
      providerMessageId: (raw.providerMessageId as string | undefined) ?? null,
      errorMessage: (raw.errorMessage as string | undefined) ?? null,
    };

    return smsLogsRepo.createLog(payload);
  },
};

export default smsLogsService;
