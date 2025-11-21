export interface PipelineStage {
  id: string;
  name: string;
  order?: number;
}

export type DocumentStatus = "accepted" | "rejected" | "pending" | "missing";

export interface PipelineDocument {
  id: string;
  name: string;
  status: DocumentStatus;
}

export interface PipelineCard {
  id: string;
  applicationId: string;
  businessName: string;
  contactName: string;
  amountRequested: number;
  currency?: string;
  productType: string;
  stageId: string;
  updatedAt: string;
  documents?: PipelineDocument[];
  documentCompletion?: number;
  docsUploaded?: number;
  docsRequired?: number;
  ocrStatus?: "pending" | "completed" | "conflict";
  bankingStatus?: "pending" | "analyzing" | "complete";
  likelihoodScore?: number;
  hasMissingDocs?: boolean;
  hasOcrConflicts?: boolean;
  hasBankingAnomalies?: boolean;
}

export type Pipeline = Record<string, PipelineCard[]>;
