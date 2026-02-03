import { apiClient, type RequestOptions } from "./httpClient";
import { clientApi } from "./client";
import type {
  Lender,
  LenderPayload,
  LenderProduct,
  LenderProductPayload,
  LenderProductRequirement
} from "@/types/lenderManagement.models";
import { LENDER_PRODUCT_CATEGORIES, isLenderProductCategory, type RateType } from "@/types/lenderManagement.types";

type LenderStatus = "ACTIVE" | "INACTIVE";

type LenderSummary = {
  id: string;
  name?: string;
  status?: LenderStatus;
};

export type { Lender, LenderPayload, LenderProduct, LenderProductPayload, LenderProductRequirement };

export type LenderMatch = {
  id: string;
  lenderName: string;
  productCategory?: string;
  terms?: string;
  requiredDocsStatus?: string;
};

export type LenderSubmissionStatus = "sent" | "failed" | "pending_manual";

export type LenderSubmission = {
  id: string;
  lenderProductId: string;
  status: LenderSubmissionStatus;
  transmissionId?: string | null;
  errorMessage?: string | null;
  updatedAt?: string | null;
  method?: string | null;
  externalReference?: string | null;
};

export type ClientLender = { id: string; name: string };
export type ClientLenderProduct = {
  id: string;
  name: string;
  product_type: string;
  min_amount: number | null;
  max_amount: number | null;
  lender_id: string;
  lender_name: string;
};

type LenderProductRequirementApi = {
  id: string;
  document_type: string;
  required: boolean;
  min_amount: number | null;
  max_amount: number | null;
};

type ClientRequirementResponse = {
  requirements?: LenderProductRequirementApi[];
  document_types?: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const ensureEntityHasId = <T extends { id?: string }>(
  entity: T | null | undefined,
  context: string,
  fallbackId?: string
): T & { id: string } => {
  const safeEntity = (entity ?? {}) as T;
  const rawId = typeof safeEntity.id === "string" ? safeEntity.id.trim() : "";
  if (!rawId) {
    console.warn(`Expected ${context} response to include an id.`);
    return { ...safeEntity, id: fallbackId ?? "" } as T & { id: string };
  }
  return { ...safeEntity, id: rawId } as T & { id: string };
};

const parseLendersResponse = (data: unknown): LenderSummary[] => {
  if (Array.isArray(data)) {
    return data as LenderSummary[];
  }
  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items as LenderSummary[];
  }
  return [];
};

const normalizeLenderStatus = (value: unknown): LenderStatus | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === "ACTIVE" || normalized === "INACTIVE") return normalized;
  return undefined;
};

const normalizeRateType = (value: unknown): RateType => {
  if (typeof value !== "string") return "fixed";
  const normalized = value.trim().toLowerCase();
  if (normalized === "fixed" || normalized === "variable" || normalized === "factor") {
    return normalized as RateType;
  }
  return "fixed";
};

const normalizeLenderCountry = (value?: string | null) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "";
  const normalized = trimmed.toUpperCase();
  if (normalized === "CA" || normalized === "CANADA") return "CA";
  if (normalized === "US" || normalized === "USA" || normalized === "UNITED STATES") return "US";
  if (normalized === "BOTH") return "BOTH";
  return trimmed;
};

const parseListItems = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (isRecord(data) && Array.isArray(data.items)) {
    return data.items as T[];
  }
  return [];
};

const normalizeInterestValue = (rateType: RateType, value: unknown): number | string => {
  if (rateType === "variable") {
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return "";
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? 0 : numeric;
  }
  return 0;
};

const normalizeRequiredDocuments = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return { category: entry, required: true, description: null };
      }
      if (!isRecord(entry)) return null;
      const category = typeof entry.category === "string" ? entry.category : "";
      if (!category) return null;
      return {
        category,
        required: typeof entry.required === "boolean" ? entry.required : true,
        description: typeof entry.description === "string" ? entry.description : null
      };
    })
    .filter((entry): entry is LenderProduct["requiredDocuments"][number] => Boolean(entry));
};

const normalizeLender = (raw: LenderSummary): Lender | null => {
  if (!raw?.id || typeof raw.id !== "string") return null;
  const status = normalizeLenderStatus(raw.status ?? (raw as Lender).status ?? (raw as { status?: unknown }).status);
  const activeValue =
    typeof (raw as Lender).active === "boolean"
      ? (raw as Lender).active
      : typeof (raw as { active?: unknown }).active === "boolean"
        ? (raw as { active: boolean }).active
        : undefined;
  const resolvedStatus = status ?? (activeValue !== undefined ? (activeValue ? "ACTIVE" : "INACTIVE") : "INACTIVE");
  const active = activeValue ?? resolvedStatus === "ACTIVE";

  const rawCountry =
    typeof (raw as { country?: unknown }).country === "string"
      ? (raw as { country: string }).country
      : isRecord((raw as Lender).address)
        ? (raw as Lender).address.country
        : "";
  const address = isRecord((raw as Lender).address)
    ? {
        street: typeof (raw as Lender).address.street === "string" ? (raw as Lender).address.street : "",
        city: typeof (raw as Lender).address.city === "string" ? (raw as Lender).address.city : "",
        stateProvince:
          typeof (raw as Lender).address.stateProvince === "string"
            ? (raw as Lender).address.stateProvince
            : typeof (raw as { region?: unknown }).region === "string"
              ? (raw as { region: string }).region
              : "",
        postalCode:
          typeof (raw as Lender).address.postalCode === "string"
            ? (raw as Lender).address.postalCode
            : "",
        country: normalizeLenderCountry(rawCountry)
      }
    : {
        street: typeof (raw as { street?: unknown }).street === "string" ? (raw as { street: string }).street : "",
        city: typeof (raw as { city?: unknown }).city === "string" ? (raw as { city: string }).city : "",
        stateProvince:
          typeof (raw as { region?: unknown }).region === "string"
            ? (raw as { region: string }).region
            : typeof (raw as { stateProvince?: unknown }).stateProvince === "string"
              ? (raw as { stateProvince: string }).stateProvince
              : "",
        postalCode:
          typeof (raw as { postal_code?: unknown }).postal_code === "string"
            ? (raw as { postal_code: string }).postal_code
            : "",
        country: normalizeLenderCountry(rawCountry)
      };

  const primaryContact = isRecord((raw as Lender).primaryContact)
    ? {
        name:
          typeof (raw as Lender).primaryContact.name === "string" ? (raw as Lender).primaryContact.name : "",
        email:
          typeof (raw as Lender).primaryContact.email === "string" ? (raw as Lender).primaryContact.email : "",
        phone:
          typeof (raw as Lender).primaryContact.phone === "string" ? (raw as Lender).primaryContact.phone : "",
        mobilePhone:
          typeof (raw as Lender).primaryContact.mobilePhone === "string"
            ? (raw as Lender).primaryContact.mobilePhone
            : ""
      }
    : {
        name:
          typeof (raw as { contact_name?: unknown }).contact_name === "string"
            ? (raw as { contact_name: string }).contact_name
            : typeof (raw as { primary_contact_name?: unknown }).primary_contact_name === "string"
              ? (raw as { primary_contact_name: string }).primary_contact_name
              : "",
        email:
          typeof (raw as { contact_email?: unknown }).contact_email === "string"
            ? (raw as { contact_email: string }).contact_email
            : typeof (raw as { primary_contact_email?: unknown }).primary_contact_email === "string"
              ? (raw as { primary_contact_email: string }).primary_contact_email
              : "",
        phone:
          typeof (raw as { contact_phone?: unknown }).contact_phone === "string"
            ? (raw as { contact_phone: string }).contact_phone
            : typeof (raw as { primary_contact_phone?: unknown }).primary_contact_phone === "string"
              ? (raw as { primary_contact_phone: string }).primary_contact_phone
              : "",
        mobilePhone: ""
      };

  const submissionConfig = isRecord((raw as Lender).submissionConfig)
    ? {
        method:
          (raw as Lender).submissionConfig.method === "API" ||
          (raw as Lender).submissionConfig.method === "EMAIL" ||
          (raw as Lender).submissionConfig.method === "GOOGLE_SHEET" ||
          (raw as Lender).submissionConfig.method === "MANUAL"
            ? (raw as Lender).submissionConfig.method
            : "MANUAL",
        sheetId: (raw as Lender).submissionConfig.sheetId ?? null,
        worksheetName: (raw as Lender).submissionConfig.worksheetName ?? null,
        mappingPreview: (raw as Lender).submissionConfig.mappingPreview ?? null,
        sheetStatus: (raw as Lender).submissionConfig.sheetStatus ?? null,
        attachmentFormat: (raw as Lender).submissionConfig.attachmentFormat ?? null,
        apiAuthType: (raw as Lender).submissionConfig.apiAuthType ?? null,
        apiBaseUrl: (raw as Lender).submissionConfig.apiBaseUrl ?? null,
        apiClientId: (raw as Lender).submissionConfig.apiClientId ?? null,
        apiUsername: (raw as Lender).submissionConfig.apiUsername ?? null,
        apiPassword: (raw as Lender).submissionConfig.apiPassword ?? null,
        submissionEmail: (raw as Lender).submissionConfig.submissionEmail ?? null
      }
    : {
        method:
          typeof (raw as { submission_method?: unknown }).submission_method === "string" &&
          ["API", "EMAIL", "MANUAL", "GOOGLE_SHEET"].includes((raw as { submission_method: string }).submission_method)
            ? ((raw as { submission_method: string }).submission_method as Lender["submissionConfig"]["method"])
            : "MANUAL",
        sheetId:
          typeof (raw as { submission_sheet_id?: unknown }).submission_sheet_id === "string"
            ? (raw as { submission_sheet_id: string }).submission_sheet_id
            : null,
        worksheetName:
          typeof (raw as { submission_worksheet_name?: unknown }).submission_worksheet_name === "string"
            ? (raw as { submission_worksheet_name: string }).submission_worksheet_name
            : null,
        mappingPreview:
          typeof (raw as { submission_mapping_preview?: unknown }).submission_mapping_preview === "string"
            ? (raw as { submission_mapping_preview: string }).submission_mapping_preview
            : null,
        sheetStatus:
          typeof (raw as { submission_sheet_status?: unknown }).submission_sheet_status === "string"
            ? (raw as { submission_sheet_status: string }).submission_sheet_status
            : null,
        attachmentFormat:
          typeof (raw as { submission_attachment_format?: unknown }).submission_attachment_format === "string"
            ? ((raw as { submission_attachment_format: "PDF" | "CSV" }).submission_attachment_format as
                | "PDF"
                | "CSV")
            : null,
        apiAuthType:
          typeof (raw as { submission_api_auth_type?: unknown }).submission_api_auth_type === "string"
            ? ((raw as { submission_api_auth_type: "token" | "key" }).submission_api_auth_type as "token" | "key")
            : null,
        apiBaseUrl:
          typeof (raw as { submission_api_endpoint?: unknown }).submission_api_endpoint === "string"
            ? (raw as { submission_api_endpoint: string }).submission_api_endpoint
            : null,
        apiClientId: null,
        apiUsername: null,
        apiPassword: null,
        submissionEmail:
          typeof (raw as { submission_email?: unknown }).submission_email === "string"
            ? (raw as { submission_email: string }).submission_email
            : null
      };

  const operationalLimits = isRecord((raw as Lender).operationalLimits)
    ? {
        maxLendingLimit: (raw as Lender).operationalLimits.maxLendingLimit ?? null,
        maxLtv: (raw as Lender).operationalLimits.maxLtv ?? null,
        maxLoanTerm: (raw as Lender).operationalLimits.maxLoanTerm ?? null,
        maxAmortization: (raw as Lender).operationalLimits.maxAmortization ?? null
      }
    : {
        maxLendingLimit: null,
        maxLtv: null,
        maxLoanTerm: null,
        maxAmortization: null
      };

  return {
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : "",
    active,
    status: resolvedStatus,
    address,
    phone: typeof (raw as Lender).phone === "string" ? (raw as Lender).phone : "",
    website: (raw as Lender).website ?? null,
    description: (raw as Lender).description ?? null,
    internalNotes: (raw as Lender).internalNotes ?? (raw as { internal_notes?: unknown }).internal_notes ?? null,
    processingNotes: (raw as Lender).processingNotes ?? null,
    primaryContact,
    submissionConfig,
    operationalLimits
  };
};

const normalizeLenderProduct = (raw: unknown): LenderProduct | null => {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!id) return null;
  const lenderId =
    typeof raw.lenderId === "string"
      ? raw.lenderId
      : typeof raw.lender_id === "string"
        ? raw.lender_id
        : "";
  const productName =
    typeof raw.productName === "string"
      ? raw.productName
      : typeof raw.product_name === "string"
        ? raw.product_name
        : typeof raw.name === "string"
          ? raw.name
          : "";
  const active = typeof raw.active === "boolean" ? raw.active : true;
  const rawCategory =
    typeof raw.category === "string"
      ? raw.category
      : typeof raw.product_category === "string"
        ? raw.product_category
        : "";
  const category = isLenderProductCategory(rawCategory) ? rawCategory : LENDER_PRODUCT_CATEGORIES[0];
  const country = normalizeLenderCountry(typeof raw.country === "string" ? raw.country : "") as LenderProduct["country"];
  const currency =
    typeof raw.currency === "string"
      ? raw.currency
      : country === "CA"
        ? "CAD"
        : country === "US"
          ? "USD"
          : "CAD/USD";
  const rateType = normalizeRateType(raw.rateType ?? raw.rate_type ?? raw.interest_type);
  const minAmount = typeof raw.minAmount === "number" ? raw.minAmount : Number(raw.min_amount ?? raw.minAmount ?? 0);
  const maxAmount = typeof raw.maxAmount === "number" ? raw.maxAmount : Number(raw.max_amount ?? raw.maxAmount ?? 0);
  const interestRateMin = normalizeInterestValue(rateType, raw.interestRateMin ?? raw.interest_min);
  const interestRateMax = normalizeInterestValue(rateType, raw.interestRateMax ?? raw.interest_max);
  const termLength = isRecord(raw.termLength)
    ? {
        min: typeof raw.termLength.min === "number" ? raw.termLength.min : Number(raw.termLength.min ?? 0),
        max: typeof raw.termLength.max === "number" ? raw.termLength.max : Number(raw.termLength.max ?? 0),
        unit: typeof raw.termLength.unit === "string" ? raw.termLength.unit : "months"
      }
    : {
        min: Number(raw.term_min_months ?? raw.termMin ?? 0),
        max: Number(raw.term_max_months ?? raw.termMax ?? 0),
        unit: "months"
      };
  const eligibilityFlags = isRecord(raw.eligibilityFlags)
    ? {
        minimumRevenue: raw.eligibilityFlags.minimumRevenue ?? null,
        timeInBusinessMonths: raw.eligibilityFlags.timeInBusinessMonths ?? null,
        industryRestrictions: raw.eligibilityFlags.industryRestrictions ?? null
      }
    : {
        minimumRevenue: null,
        timeInBusinessMonths: null,
        industryRestrictions: null
      };
  const requiredDocuments = normalizeRequiredDocuments(raw.requiredDocuments ?? raw.required_documents);

  return {
    id,
    lenderId,
    productName,
    active,
    category,
    country: country || "US",
    currency,
    minAmount: Number.isNaN(minAmount) ? 0 : minAmount,
    maxAmount: Number.isNaN(maxAmount) ? 0 : maxAmount,
    interestRateMin,
    interestRateMax,
    rateType,
    termLength: {
      min: Number.isNaN(termLength.min) ? 0 : termLength.min,
      max: Number.isNaN(termLength.max) ? 0 : termLength.max,
      unit: termLength.unit === "years" || termLength.unit === "months" ? termLength.unit : "months"
    },
    fees: typeof raw.fees === "string" ? raw.fees : null,
    minimumCreditScore: typeof raw.minimumCreditScore === "number" ? raw.minimumCreditScore : null,
    ltv: typeof raw.ltv === "number" ? raw.ltv : null,
    eligibilityRules: typeof raw.eligibilityRules === "string" ? raw.eligibilityRules : null,
    eligibilityFlags,
    requiredDocuments
  };
};

export const fetchLenders = async (options?: RequestOptions) => {
  const res = await apiClient.get<unknown>("/lenders", options);
  const lenders = parseLendersResponse(res)
    .map((item) => normalizeLender(item))
    .filter((item): item is Lender => Boolean(item));
  return lenders;
};

export const fetchLenderById = async (id: string) => {
  const lender = await apiClient.get<unknown>(`/lenders/${id}`);
  const normalized = normalizeLender(ensureEntityHasId((lender ?? {}) as LenderSummary, "lender", id));
  return ensureEntityHasId(normalized ?? (lender as Lender), "lender", id);
};

export const createLender = async (payload: LenderPayload) => {
  const lender = await apiClient.post<unknown>(`/lenders`, payload);
  const normalized = normalizeLender(ensureEntityHasId((lender ?? {}) as LenderSummary, "lender"));
  return ensureEntityHasId(normalized ?? (lender as Lender), "lender");
};

export const updateLender = async (id: string, payload: Partial<LenderPayload>) => {
  const lender = await apiClient.patch<unknown>(`/lenders/${id}`, payload);
  const normalized = normalizeLender(ensureEntityHasId((lender ?? {}) as LenderSummary, "lender", id));
  return ensureEntityHasId(normalized ?? (lender as Lender), "lender", id);
};

export const fetchLenderProducts = async (lenderId?: string, options?: RequestOptions) => {
  const res = await apiClient.get<unknown>(`/lender-products`, {
    params: lenderId ? { lenderId } : undefined,
    ...options
  });
  const items = parseListItems<unknown>(res);
  return items
    .map((item) => normalizeLenderProduct(item))
    .filter((item): item is LenderProduct => Boolean(item));
};

export const fetchLenderProductById = async (productId: string) => {
  const product = await apiClient.get<unknown>(`/lender-products/${productId}`);
  const normalized = normalizeLenderProduct(ensureEntityHasId((product ?? {}) as { id?: string }, "lender product", productId));
  return ensureEntityHasId(normalized ?? (product as LenderProduct), "lender product", productId);
};

export const createLenderProduct = async (payload: LenderProductPayload) => {
  const product = await apiClient.post<unknown>(`/lender-products`, payload);
  const normalized = normalizeLenderProduct(ensureEntityHasId((product ?? {}) as { id?: string }, "lender product"));
  return ensureEntityHasId(normalized ?? (product as LenderProduct), "lender product");
};

export const updateLenderProduct = async (productId: string, payload: Partial<LenderProductPayload>) => {
  const product = await apiClient.put<unknown>(`/lender-products/${productId}`, payload);
  const normalized = normalizeLenderProduct(ensureEntityHasId((product ?? {}) as { id?: string }, "lender product", productId));
  return ensureEntityHasId(normalized ?? (product as LenderProduct), "lender product", productId);
};

export const fetchLenderMatches = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<LenderMatch[]>(`/applications/${applicationId}/lenders`, options);

export const createLenderSubmission = (applicationId: string, lenderProductIds: string[]) =>
  apiClient.post(`/lender/submissions`, { applicationId, lenderProductIds });

export const fetchLenderSubmissions = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<LenderSubmission[]>(`/lender/submissions`, {
    ...options,
    params: { applicationId, ...(options?.params ?? {}) }
  });

export const retryLenderSubmission = (applicationId: string, lenderProductId?: string) =>
  apiClient.post(`/lender-submissions/${applicationId}/submit`, lenderProductId ? { lenderProductId } : undefined);

export const retryLenderTransmission = (transmissionId: string) =>
  apiClient.post(`/admin/transmissions/${transmissionId}/retry`);

export async function fetchClientLenders(): Promise<ClientLender[]> {
  const res = await clientApi.get("/api/client/lenders");
  const payload = res.data?.data ?? res.data;
  if (Array.isArray(payload)) {
    return payload as ClientLender[];
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: ClientLender[] }).items;
  }
  return [];
}

export async function fetchClientLenderProducts(): Promise<ClientLenderProduct[]> {
  const res = await clientApi.get("/api/client/lender-products");
  const payload = res.data?.data ?? res.data;
  if (Array.isArray(payload)) {
    return payload as ClientLenderProduct[];
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: ClientLenderProduct[] }).items;
  }
  return [];
}

const normalizeRequirement = (requirement: LenderProductRequirementApi): LenderProductRequirement => ({
  id: requirement.id,
  documentType: requirement.document_type ?? "",
  required: Boolean(requirement.required),
  minAmount: requirement.min_amount ?? null,
  maxAmount: requirement.max_amount ?? null
});

const parseRequirementResponse = (data: unknown) => {
  if (Array.isArray(data)) {
    return { requirements: data as LenderProductRequirementApi[] };
  }
  if (isRecord(data)) {
    const requirements = Array.isArray((data as ClientRequirementResponse).requirements)
      ? ((data as ClientRequirementResponse).requirements as LenderProductRequirementApi[])
      : Array.isArray((data as { items?: unknown }).items)
        ? ((data as { items: LenderProductRequirementApi[] }).items ?? [])
        : [];
    const documentTypes = Array.isArray((data as ClientRequirementResponse).document_types)
      ? ((data as ClientRequirementResponse).document_types as string[])
      : undefined;
    return { requirements, documentTypes };
  }
  return { requirements: [] as LenderProductRequirementApi[] };
};

export async function fetchClientLenderProductRequirements(productId: string) {
  const res = await clientApi.get(`/api/client/lender-products/${productId}/requirements`);
  const payload = res.data?.data ?? res.data;
  const parsed = parseRequirementResponse(payload);
  return {
    requirements: parsed.requirements.map(normalizeRequirement),
    documentTypes: parsed.documentTypes
  };
}

export const createLenderProductRequirement = async (
  productId: string,
  payload: Omit<LenderProductRequirementApi, "id">
) => {
  const requirement = await apiClient.post<LenderProductRequirementApi>(
    `/lender-products/${productId}/requirements`,
    payload
  );
  return normalizeRequirement(ensureEntityHasId(requirement, "requirement"));
};

export const updateLenderProductRequirement = async (
  productId: string,
  requirementId: string,
  payload: Omit<LenderProductRequirementApi, "id">
) => {
  const requirement = await apiClient.put<LenderProductRequirementApi>(
    `/lender-products/${productId}/requirements/${requirementId}`,
    payload
  );
  return normalizeRequirement(ensureEntityHasId(requirement, "requirement", requirementId));
};

export const deleteLenderProductRequirement = (productId: string, requirementId: string) =>
  apiClient.delete(`/lender-products/${productId}/requirements/${requirementId}`);
