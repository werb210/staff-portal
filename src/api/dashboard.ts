import { apiClient } from "@/api/httpClient";

export type PipelineOverview = {
  newApplications: number;
  inReview: number;
  requiresDocs: number;
  sentToLender: number;
  offersReceived: number;
  closed: number;
  declined: number;
};

export type UrgentActions = {
  waitingOver24h: number;
  missingDocuments: number;
  offersExpiring: number;
  awaitingClientResponse: number;
};

export type DocumentHealth = {
  missingBankStatements: number;
  missingArAging: number;
  rejectedDocuments: number;
};

export type LenderActivity = {
  recentSubmissions: number;
  awaitingLenderResponse: number;
  declinedSubmissions: number;
};

export type OfferActivity = {
  newOffers: number;
  acceptedOffers: number;
  expiringOffers: number;
};

export type DealMetrics = {
  averageDealSize: number;
  approvalRate: number;
  averageApprovalTimeDays: number;
  lenderResponseTimeDays: number;
};

const withFallback = async <T>(request: Promise<unknown>, fallback: T): Promise<T> => {
  try {
    const result = await request;
    if (result && typeof result === "object") {
      return { ...fallback, ...(result as Record<string, unknown>) } as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

export const dashboardApi = {
  getPipeline: () =>
    withFallback<PipelineOverview>(apiClient.get("/api/dashboard/pipeline", { skipAuth: true }), {
      newApplications: 0,
      inReview: 0,
      requiresDocs: 0,
      sentToLender: 0,
      offersReceived: 0,
      closed: 0,
      declined: 0
    }),
  getActions: () =>
    withFallback<UrgentActions>(apiClient.get("/api/dashboard/actions", { skipAuth: true }), {
      waitingOver24h: 0,
      missingDocuments: 0,
      offersExpiring: 0,
      awaitingClientResponse: 0
    }),
  getDocumentHealth: () =>
    withFallback<DocumentHealth>(apiClient.get("/api/dashboard/document-health", { skipAuth: true }), {
      missingBankStatements: 0,
      missingArAging: 0,
      rejectedDocuments: 0
    }),
  getLenderActivity: () =>
    withFallback<LenderActivity>(apiClient.get("/api/dashboard/lender-activity", { skipAuth: true }), {
      recentSubmissions: 0,
      awaitingLenderResponse: 0,
      declinedSubmissions: 0
    }),
  getOffers: () =>
    withFallback<OfferActivity>(apiClient.get("/api/dashboard/offers", { skipAuth: true }), {
      newOffers: 0,
      acceptedOffers: 0,
      expiringOffers: 0
    }),
  getMetrics: () =>
    withFallback<DealMetrics>(apiClient.get("/api/dashboard/metrics", { skipAuth: true }), {
      averageDealSize: 0,
      approvalRate: 0,
      averageApprovalTimeDays: 0,
      lenderResponseTimeDays: 0
    })
};
