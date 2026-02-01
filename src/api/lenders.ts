import { apiClient, type ListResponse, type RequestOptions } from "./httpClient";
import { clientApi } from "./client";
import type {
  Lender,
  LenderPayload,
  LenderProduct,
  LenderProductPayload,
  LenderProductRequirement
} from "@/types/lenderManagement.models";

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

const normalizeLenderCountry = (value?: string | null) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "";
  const normalized = trimmed.toUpperCase();
  if (normalized === "CA" || normalized === "CANADA") return "Canada";
  if (normalized === "US" || normalized === "USA" || normalized === "UNITED STATES") return "United States";
  if (normalized === "BOTH") return "Both";
  return trimmed;
};

const normalizeLender = (raw: LenderSummary): Lender | null => {
  if (!raw?.id || typeof raw.id !== "string") return null;
  const active = typeof (raw as Lender).active === "boolean" ? (raw as Lender).active : false;
  const status = normalizeLenderStatus(raw.status ?? (raw as Lender).status);

  const rawCountry =
    typeof (raw as Lender).country === "string"
      ? (raw as Lender).country
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
            : "",
        postalCode:
          typeof (raw as Lender).address.postalCode === "string"
            ? (raw as Lender).address.postalCode
            : "",
        country: normalizeLenderCountry(rawCountry)
      }
    : {
        street: "",
        city: "",
        stateProvince: "",
        postalCode: "",
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
        name: "",
        email: "",
        phone: "",
        mobilePhone: ""
      };

  const submissionConfig = isRecord((raw as Lender).submissionConfig)
    ? {
        method:
          (raw as Lender).submissionConfig.method === "API" ||
          (raw as Lender).submissionConfig.method === "EMAIL" ||
          (raw as Lender).submissionConfig.method === "MANUAL"
            ? (raw as Lender).submissionConfig.method
            : "MANUAL",
        apiBaseUrl: (raw as Lender).submissionConfig.apiBaseUrl ?? null,
        apiClientId: (raw as Lender).submissionConfig.apiClientId ?? null,
        apiUsername: (raw as Lender).submissionConfig.apiUsername ?? null,
        apiPassword: (raw as Lender).submissionConfig.apiPassword ?? null,
        submissionEmail: (raw as Lender).submissionConfig.submissionEmail ?? null
      }
    : {
        method: "MANUAL",
        apiBaseUrl: null,
        apiClientId: null,
        apiUsername: null,
        apiPassword: null,
        submissionEmail: null
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
    status,
    address,
    phone: typeof (raw as Lender).phone === "string" ? (raw as Lender).phone : "",
    website: (raw as Lender).website ?? null,
    description: (raw as Lender).description ?? null,
    internalNotes: (raw as Lender).internalNotes ?? null,
    processingNotes: (raw as Lender).processingNotes ?? null,
    primaryContact,
    submissionConfig,
    operationalLimits
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
  const lender = await apiClient.get<Lender>(`/lenders/${id}`);
  return ensureEntityHasId(lender, "lender", id);
};

export const createLender = async (payload: LenderPayload) => {
  const lender = await apiClient.post<Lender>(`/lenders`, payload);
  return ensureEntityHasId(lender, "lender");
};

export const updateLender = async (id: string, payload: Partial<LenderPayload>) => {
  const lender = await apiClient.patch<Lender>(`/lenders/${id}`, payload);
  return ensureEntityHasId(lender, "lender", id);
};

export const fetchLenderProducts = async (lenderId?: string, options?: RequestOptions) => {
  const res: ListResponse<LenderProduct> = await apiClient.getList<LenderProduct>(`/lender-products`, {
    params: lenderId ? { lenderId } : undefined,
    ...options
  });
  const items = Array.isArray(res.items) ? res.items : [];
  return items.map((item) => ensureEntityHasId(item, "lender product", item.id));
};

export const fetchLenderProductById = async (productId: string) => {
  const product = await apiClient.get<LenderProduct>(`/lender-products/${productId}`);
  return ensureEntityHasId(product, "lender product", productId);
};

export const createLenderProduct = async (payload: LenderProductPayload) => {
  const product = await apiClient.post<LenderProduct>(`/lender-products`, payload);
  return ensureEntityHasId(product, "lender product");
};

export const updateLenderProduct = async (productId: string, payload: Partial<LenderProductPayload>) => {
  const product = await apiClient.put<LenderProduct>(`/lender-products/${productId}`, payload);
  return ensureEntityHasId(product, "lender product", productId);
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
