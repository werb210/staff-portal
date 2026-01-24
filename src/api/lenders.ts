import { apiClient, type ListResponse, type RequestOptions } from "./httpClient";
import type {
  Lender,
  LenderPayload,
  LenderProduct,
  LenderProductPayload
} from "@/types/lenderManagement.models";

type LenderStatus = "active" | "inactive";

type LenderSummary = {
  id: string;
  name?: string;
  status?: LenderStatus;
};

export type { Lender, LenderPayload, LenderProduct, LenderProductPayload };

export type LenderMatch = {
  id: string;
  lenderName: string;
  productCategory?: string;
  terms?: string;
  requiredDocsStatus?: string;
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

export const sendToLenders = (applicationId: string, lenderIds: string[]) =>
  apiClient.post(`/lenders/send-to-lender`, { applicationId, lenderIds });
