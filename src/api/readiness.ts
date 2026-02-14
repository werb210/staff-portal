import api from "@/api/client";

export type ReadinessLeadStatus = "new" | "qualified" | "converted" | "archived" | string;

export interface ReadinessLead {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  industry: string;
  yearsInBusiness: number | null;
  monthlyRevenue: number | null;
  accountsReceivable: number | null;
  status: ReadinessLeadStatus;
  source?: string;
  tags: string[];
  debt: number | null;
  createdAt: string;
  transcriptHistory: string[];
  activityLog: string[];
}

export interface ReadinessConvertResponse {
  applicationId: string;
}

export interface ApplicationReadinessPayload {
  lead: ReadinessLead | null;
  transcriptHistory: string[];
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const parseLead = (value: unknown): ReadinessLead | null => {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string") return null;

  return {
    id: record.id,
    companyName: typeof record.companyName === "string" ? record.companyName : "",
    contactName: typeof record.contactName === "string" ? record.contactName : "",
    phone: typeof record.phone === "string" ? record.phone : "",
    email: typeof record.email === "string" ? record.email : "",
    industry: typeof record.industry === "string" ? record.industry : "",
    yearsInBusiness: asNumber(record.yearsInBusiness),
    monthlyRevenue: asNumber(record.monthlyRevenue),
    accountsReceivable: asNumber(record.accountsReceivable ?? record.ar),
    status: typeof record.status === "string" ? record.status : "new",
    source: typeof record.source === "string" ? record.source : "readiness",
    tags: asStringArray(record.tags ?? ["readiness", "startup_interest"]),
    debt: asNumber(record.debt),
    createdAt: typeof record.createdAt === "string" ? record.createdAt : new Date(0).toISOString(),
    transcriptHistory: asStringArray(record.transcriptHistory),
    activityLog: asStringArray(record.activityLog)
  };
};

export async function fetchReadinessLeads(): Promise<ReadinessLead[]> {
  const res = await api.get("/api/portal/readiness-leads");
  if (!Array.isArray(res.data)) return [];
  return res.data.map(parseLead).filter((lead): lead is ReadinessLead => lead !== null);
}

export async function convertReadinessLeadToApplication(leadId: string): Promise<ReadinessConvertResponse> {
  const res = await api.post(`/api/portal/readiness-leads/${leadId}/convert`);
  const applicationId = asRecord(res.data)?.applicationId;
  if (typeof applicationId !== "string" || applicationId.length === 0) {
    throw new Error("Convert response missing applicationId");
  }
  return { applicationId };
}

export async function fetchApplicationReadiness(
  applicationId: string,
  options: { signal?: AbortSignal } = {}
): Promise<ApplicationReadinessPayload> {
  const res = await api.get(`/api/portal/applications/${applicationId}/readiness`, options);
  const payload = asRecord(res.data);
  if (!payload) {
    return { lead: null, transcriptHistory: [] };
  }

  return {
    lead: parseLead(payload.lead),
    transcriptHistory: asStringArray(payload.transcriptHistory)
  };
}
