export type ApplicationMatchScore = {
  productId?: string;
  productName?: string;
  matchPercentage?: number | string | null;
  status?: string;
  notes?: string;
};

export type ApplicationAuditEvent = {
  id: string;
  type: string;
  createdAt: string;
  actor?: string;
  detail?: Record<string, unknown> | string | null;
};

export type ApplicationDetails = {
  id: string;
  applicant?: string;
  status?: string;
  submittedAt?: string;
  stage?: string;
  overview?: Record<string, unknown> | null;
  businessDetails?: Record<string, unknown> | null;
  applicantDetails?: Record<string, unknown> | null;
  financialProfile?: Record<string, unknown> | null;
  productFit?: Record<string, unknown> | null;
  matchScores?: ApplicationMatchScore[] | null;
  documents?: Record<string, unknown> | null;
  auditTimeline?: ApplicationAuditEvent[] | null;
  rawPayload?: Record<string, unknown> | null;
  kyc?: Record<string, unknown> | null;
  business?: Record<string, unknown> | null;
  applicantInfo?: Record<string, unknown> | null;
  owners?: Array<Record<string, unknown>>;
  fundingRequest?: Record<string, unknown> | null;
  productCategory?: string | null;
  ocr_completed_at?: string | null;
  banking_completed_at?: string | null;
  ocrCompletedAt?: string | null;
  bankingCompletedAt?: string | null;
};

export type PortalApplicationRecord = {
  id: string;
  stage?: string;
  current_stage?: string;
  source?: string;
  business?: Record<string, unknown> | null;
  operations?: Record<string, unknown> | null;
  primaryContact?: Record<string, unknown> | null;
  auditTimeline?: ApplicationAuditEvent[] | null;
  audit_events?: ApplicationAuditEvent[] | null;
  [key: string]: unknown;
};
