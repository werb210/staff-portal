import { apiClient } from "@/lib/apiClient";
import { useCrmStore } from "@/state/crm.store";
import type { CRMLead } from "@/types/crm";

type ApiLead = Record<string, unknown>;

type ApiResponse<T> = { data?: T } & T;

async function unwrap<T>(request: Promise<ApiResponse<T>>): Promise<T> {
  const response = await request;
  return (response as { data?: T }).data ?? (response as T);
}

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  silo: "BF" | "BI" | "SLF";
  owner: string;
  tags: string[];
  source?: string;
  hasActiveApplication: boolean;
  companyIds: string[];
  applicationIds: string[];
  referrerId?: string;
  referrerName?: string;
};

export type Company = {
  id: string;
  name: string;
  silo: "BF" | "BI" | "SLF";
  industry: string;
  website?: string;
  owner: string;
  tags: string[];
  contactIds: string[];
  referrerId?: string;
  referrerName?: string;
};

export type TimelineEventType =
  | "call"
  | "sms"
  | "email"
  | "note"
  | "document"
  | "status"
  | "ai"
  | "lender"
  | "system"
  | "RULE_TRIGGERED"
  | "AUTO_SMS_SENT"
  | "AUTO_TASK_CREATED"
  | "FOLLOW_UP_REMINDER";

export type AutomationMetadata = {
  ruleId: string;
  triggerReason: string;
  delayCondition: string;
  action: string;
  internalNotes?: string;
};

export type TimelineEvent = {
  id: string;
  entityId: string;
  entityType: "contact" | "company";
  type: TimelineEventType;
  occurredAt: string;
  direction?: "inbound" | "outbound";
  summary: string;
  details?: string;
  automation?: AutomationMetadata;
  call?: {
    outcome: string;
    durationSeconds: number;
    failureReason?: string | null;
    recordingUrl?: string | null;
  };
};

export const fetchContacts = async () => {
  const { silo, filters } = useCrmStore.getState();
  const params = new URLSearchParams({ silo });

  if (filters.search) params.set("search", filters.search);
  if (filters.owner) params.set("owner", filters.owner);
  if (filters.hasActiveApplication) params.set("hasActiveApplication", "true");

  return unwrap<Contact[]>(apiClient.get(`/api/crm/contacts?${params.toString()}`));
};

export const fetchCompanies = async () => {
  const { silo } = useCrmStore.getState();
  const params = new URLSearchParams({ silo });
  return unwrap<Company[]>(apiClient.get(`/api/crm/companies?${params.toString()}`));
};

export const fetchTimeline = async (entityType: "contact" | "company", entityId: string) => {
  const params = new URLSearchParams({ entityType, entityId });
  return unwrap<TimelineEvent[]>(apiClient.get(`/api/crm/timeline?${params.toString()}`));
};

export const createNote = async (entityId: string, summary: string) => {
  return unwrap<TimelineEvent>(apiClient.post("/api/crm/timeline/notes", { entityId, summary }));
};

export const logCallEvent = async (payload: {
  contactId: string;
  number: string;
  durationSeconds: number;
  outcome: string;
  failureReason?: string | null;
}) => {
  return unwrap<TimelineEvent>(apiClient.post("/api/crm/timeline/calls", payload));
};

export const fetchApplications = async (contactId: string) => {
  return unwrap<{ id: string; stage: string; contactId: string }[]>(apiClient.get(`/api/crm/contacts/${contactId}/applications`));
};

export const fetchContactCompanies = async (contact: Contact) => {
  return unwrap<Company[]>(apiClient.get(`/api/crm/contacts/${contact.id}/companies`));
};

export const fetchCompanyContacts = async (company: Company) => {
  return unwrap<Contact[]>(apiClient.get(`/api/crm/companies/${company.id}/contacts`));
};

export const createContact = async (payload: {
  name: string;
  email: string;
  phone: string;
  silo: Contact["silo"];
  owner: string;
  tags?: string[];
  referrerId?: string;
  referrerName?: string;
}) => {
  return unwrap<Contact>(apiClient.post("/api/crm/contacts", payload));
};

export const createCompany = async (payload: {
  name: string;
  silo: Company["silo"];
  industry?: string;
  website?: string;
  owner: string;
  tags?: string[];
  referrerId?: string;
  referrerName?: string;
}) => {
  return unwrap<Company>(apiClient.post("/api/crm/companies", payload));
};

export const linkContactCompany = async (contactId: string, companyId: string) => {
  return unwrap<{ contact: Contact; company: Company }>(
    apiClient.post(`/api/crm/contacts/${contactId}/companies/${companyId}`)
  );
};

export const createContactApplication = async (payload: { contactId: string; stage: string }) => {
  return unwrap<{ id: string; stage: string; contactId: string }>(apiClient.post("/api/crm/applications", payload));
};

export async function fetchLeads() {
  return unwrap<ApiLead[] | { leads?: ApiLead[] }>(apiClient.get("/api/crm/leads"));
}

export async function fetchLeadById(id: string) {
  return unwrap(apiClient.get(`/api/crm/leads/${id}`));
}

export async function fetchCreditReadinessLeads(): Promise<CRMLead[]> {
  return unwrap<CRMLead[]>(apiClient.get("/api/crm/credit-readiness"));
}

export async function convertReadinessToApplication(id: string) {
  return unwrap(apiClient.post(`/api/crm/credit-readiness/${id}/convert`));
}

export async function fetchChatSessions() {
  return unwrap(apiClient.get("/api/chat/sessions"));
}

export async function fetchContinuationLeads() {
  return unwrap(apiClient.get("/api/application/continuations"));
}
