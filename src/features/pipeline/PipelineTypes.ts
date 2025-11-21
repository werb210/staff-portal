export type PipelineStage =
  | "new"
  | "requires_docs"
  | "in_review"
  | "ready_for_lender"
  | "sent_to_lender"
  | "funded"
  | "closed";

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
  hasMissingDocs?: boolean;
  hasOcrConflicts?: boolean;
  hasBankingAnomalies?: boolean;
}

export type Pipeline = Record<PipelineStage, PipelineCard[]>;
