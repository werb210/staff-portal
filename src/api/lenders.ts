import { apiClient, type ListResponse, type RequestOptions } from "./httpClient";
import { clientApi } from "./client";
import type {
  Lender,
  LenderPayload,
  LenderProduct,
  LenderProductPayload,
  LenderProductRequirement
} from "@/types/lenderManagement.models";

type LenderStatus = "active" | "inactive";

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

const assertEntityHasId = <T extends { id?: string }>(entity: T, context: string): T => {
  const id = entity?.id;
  if (typeof id !== "string" || !id.trim()) {
    throw new Error(`Expected ${context} response to include an id.`);
  }
  return entity;
};

const assertEntitiesHaveIds = <T extends { id?: string }>(entities: T[], context: string) => {
  entities.forEach((entity) => {
    assertEntityHasId(entity, context);
  });
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

const normalizeLender = (raw: LenderSummary): Lender | null => {
  if (!raw?.id || typeof raw.id !== "string") return null;
  const status = raw.status;
  const active =
    typeof (raw as Lender).active === "boolean"
      ? (raw as Lender).active
      : status === "active";

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
        country: typeof (raw as Lender).address.country === "string" ? (raw as Lender).address.country : ""
      }
    : {
        street: "",
        city: "",
        stateProvince: "",
        postalCode: "",
        country: ""
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
  if (lenders.length) {
    assertEntitiesHaveIds(lenders, "lender");
  }
  return lenders;
};

export const fetchLenderById = async (id: string) => {
  const lender = await apiClient.get<Lender>(`/lenders/${id}`);
  return assertEntityHasId(lender, "lender");
};

export const createLender = async (payload: LenderPayload) => {
  const lender = await apiClient.post<Lender>(`/lenders`, payload);
  return assertEntityHasId(lender, "lender");
};

export const updateLender = async (id: string, payload: Partial<LenderPayload>) => {
  const lender = await apiClient.put<Lender>(`/lenders/${id}`, payload);
  return assertEntityHasId(lender, "lender");
};

export const fetchLenderProducts = async (lenderId?: string) => {
  const res: ListResponse<LenderProduct> = await apiClient.getList<LenderProduct>(`/lender-products`, {
    params: lenderId ? { lenderId } : undefined
  });
  if (res.items.length) {
    assertEntitiesHaveIds(res.items, "lender product");
  }
  return res.items;
};

export const fetchLenderProductById = async (productId: string) => {
  const product = await apiClient.get<LenderProduct>(`/lender-products/${productId}`);
  return assertEntityHasId(product, "lender product");
};

export const createLenderProduct = async (payload: LenderProductPayload) => {
  const product = await apiClient.post<LenderProduct>(`/lender-products`, payload);
  return assertEntityHasId(product, "lender product");
};

export const updateLenderProduct = async (productId: string, payload: Partial<LenderProductPayload>) => {
  const product = await apiClient.put<LenderProduct>(`/lender-products/${productId}`, payload);
  return assertEntityHasId(product, "lender product");
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
  return res.data.data;
}

export async function fetchClientLenderProducts(): Promise<ClientLenderProduct[]> {
  const res = await clientApi.get("/api/client/lender-products");
  return res.data.data;
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
  return normalizeRequirement(assertEntityHasId(requirement, "requirement"));
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
  return normalizeRequirement(assertEntityHasId(requirement, "requirement"));
};

export const deleteLenderProductRequirement = (productId: string, requirementId: string) =>
  apiClient.delete(`/lender-products/${productId}/requirements/${requirementId}`);
