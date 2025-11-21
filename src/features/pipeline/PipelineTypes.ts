export type PipelineStage =
  | "new"
  | "requires_docs"
  | "reviewing"
  | "ready_for_lenders"
  | "sent_to_lenders"
  | "funded"
  | "closed_withdrawn";

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
  productType: string;
  stage: PipelineStage;
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

export type Pipeline = Record<PipelineStage, PipelineCard[]>;
