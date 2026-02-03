import { apiClient } from "@/api/httpClient";
import type { PipelineApplication, PipelineFilters, PipelineStage, PipelineStageId } from "./pipeline.types";

const buildQueryParams = (filters: PipelineFilters, stage?: PipelineStageId): string => {
  const params = new URLSearchParams();
  if (stage) params.set("stage", stage);
  if (filters.searchTerm) params.set("search", filters.searchTerm);
  if (filters.productCategory) params.set("productCategory", filters.productCategory);
  if (filters.submissionMethod) params.set("submissionMethod", filters.submissionMethod);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  if (filters.sort) params.set("sort", filters.sort);
  return params.toString();
};

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((segment) => (segment ? segment[0].toUpperCase() + segment.slice(1) : segment))
    .join(" ");

const normalizeStageId = (value: string) => value.replace(/[\s_-]+/g, "").toUpperCase();

const STAGE_LABEL_OVERRIDES: Record<string, string> = {
  RECEIVED: "Received",
  DOCUMENTSREQUIRED: "Documents Required",
  INREVIEW: "In Review",
  STARTUP: "Startup",
  OFFTOLENDER: "Off to Lender",
  ACCEPTED: "Accepted",
  DECLINED: "Declined"
};

const parseStage = (item: unknown): PipelineStage | null => {
  if (typeof item === "string") {
    const trimmed = item.trim();
    if (!trimmed) return null;
    const label = toTitleCase(trimmed);
    return { id: trimmed, label };
  }
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : typeof record.value === "string" ? record.value : "";
  if (!id) return null;
  const label =
    typeof record.label === "string"
      ? record.label
      : typeof record.name === "string"
        ? record.name
        : toTitleCase(id);
  const normalizedId = normalizeStageId(id);
  const description = typeof record.description === "string" ? record.description : undefined;
  const terminal = typeof record.terminal === "boolean" ? record.terminal : undefined;
  const order = typeof record.order === "number" ? record.order : undefined;
  const allowedTransitions = Array.isArray(record.allowedTransitions)
    ? record.allowedTransitions.filter((stageId) => typeof stageId === "string") as PipelineStageId[]
    : Array.isArray(record.nextStages)
      ? record.nextStages.filter((stageId) => typeof stageId === "string") as PipelineStageId[]
      : undefined;
  return {
    id,
    label: STAGE_LABEL_OVERRIDES[normalizedId] ?? label,
    description,
    terminal,
    allowedTransitions,
    order
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : undefined;

const normalizePipelineApplication = (value: unknown): PipelineApplication | null => {
  if (!isRecord(value)) return null;
  const id =
    typeof value.id === "string"
      ? value.id
      : typeof value.application_id === "string"
        ? value.application_id
        : "";
  if (!id) return null;
  const createdAt =
    typeof value.createdAt === "string"
      ? value.createdAt
      : typeof value.created_at === "string"
        ? value.created_at
        : "";
  const documents = isRecord(value.documents)
    ? {
        submitted:
          typeof value.documents.submitted === "number" ? value.documents.submitted : undefined,
        required:
          typeof value.documents.required === "number" ? value.documents.required : undefined
      }
    : {
        submitted:
          typeof value.documents_submitted === "number" ? value.documents_submitted : undefined,
        required:
          typeof value.documents_required === "number" ? value.documents_required : undefined
      };
  return {
    id,
    businessName:
      typeof value.businessName === "string"
        ? value.businessName
        : typeof value.business_name === "string"
          ? value.business_name
          : undefined,
    contactName:
      typeof value.contactName === "string"
        ? value.contactName
        : typeof value.contact_name === "string"
          ? value.contact_name
          : undefined,
    requestedAmount:
      typeof value.requestedAmount === "number"
        ? value.requestedAmount
        : typeof value.requested_amount === "number"
          ? value.requested_amount
          : undefined,
    productCategory:
      typeof value.productCategory === "string"
        ? value.productCategory
        : typeof value.product_category === "string"
          ? value.product_category
          : undefined,
    submissionMethod:
      typeof value.submissionMethod === "string"
        ? value.submissionMethod
        : typeof value.submission_method === "string"
          ? value.submission_method
          : undefined,
    stage:
      typeof value.stage === "string"
        ? value.stage
        : typeof value.current_stage === "string"
          ? value.current_stage
          : "",
    status: typeof value.status === "string" ? value.status : undefined,
    matchPercentage: value.matchPercentage ?? value.match_percentage ?? undefined,
    matchPercent: value.matchPercent ?? value.match_percent ?? undefined,
    matchScore: value.matchScore ?? value.match_score ?? undefined,
    documents,
    bankingComplete:
      typeof value.bankingComplete === "boolean"
        ? value.bankingComplete
        : typeof value.banking_complete === "boolean"
          ? value.banking_complete
          : undefined,
    ocrComplete:
      typeof value.ocrComplete === "boolean"
        ? value.ocrComplete
        : typeof value.ocr_complete === "boolean"
          ? value.ocr_complete
          : undefined,
    ocrMissingFields:
      parseStringArray(value.ocrMissingFields) ??
      parseStringArray(value.ocr_missing_fields) ??
      parseStringArray(value.missing_ocr_fields),
    ocrConflictCount:
      typeof value.ocrConflictCount === "number"
        ? value.ocrConflictCount
        : typeof value.ocr_conflict_count === "number"
          ? value.ocr_conflict_count
          : parseStringArray(value.ocrConflicts)?.length ??
            parseStringArray(value.ocr_conflicts)?.length ??
            parseStringArray(value.conflicting_ocr_fields)?.length,
    referrerId:
      typeof value.referrerId === "string"
        ? value.referrerId
        : typeof value.referrer_id === "string"
          ? value.referrer_id
          : undefined,
    referrerName:
      typeof value.referrerName === "string"
        ? value.referrerName
        : typeof value.referrer_name === "string"
          ? value.referrer_name
          : undefined,
    assignedStaff:
      typeof value.assignedStaff === "string"
        ? value.assignedStaff
        : typeof value.assigned_staff === "string"
          ? value.assigned_staff
          : undefined,
    createdAt
  };
};

const parsePipelineApplications = (data: unknown): PipelineApplication[] => {
  if (Array.isArray(data)) {
    return data
      .map((item) => normalizePipelineApplication(item))
      .filter((item): item is PipelineApplication => Boolean(item));
  }
  if (isRecord(data)) {
    const items = Array.isArray(data.items)
      ? data.items
      : Array.isArray((data as { data?: unknown }).data)
        ? (data as { data: unknown[] }).data
        : [];
    return items
      .map((item) => normalizePipelineApplication(item))
      .filter((item): item is PipelineApplication => Boolean(item));
  }
  return [];
};

export const pipelineApi = {
  fetchStages: async (options?: { signal?: AbortSignal }) => {
    const res = await apiClient.get<unknown>("/portal/applications/stages", options);
    if (!res) return [];
    const rawItems = Array.isArray(res)
      ? res
      : typeof res === "object" && res && Array.isArray((res as { items?: unknown[] }).items)
        ? (res as { items: unknown[] }).items
        : [];
    return rawItems.map(parseStage).filter((stage): stage is PipelineStage => Boolean(stage));
  },
  fetchColumn: async (stage: PipelineStageId, filters: PipelineFilters, options?: { signal?: AbortSignal }) => {
    const query = buildQueryParams(filters, stage);
    const path = query ? `/portal/applications?${query}` : "/portal/applications";
    const res = await apiClient.get<unknown>(path, options);
    return parsePipelineApplications(res);
  },
  moveCard: async (applicationId: string, newStage: PipelineStageId) => {
    return apiClient.patch<PipelineApplication>(`/applications/${applicationId}/status`, { stage: newStage });
  },
  fetchSummary: async (applicationId: string) => {
    return apiClient.get<PipelineApplication>(`/applications/${applicationId}/summary`);
  }
};

export type PipelineApi = typeof pipelineApi;
