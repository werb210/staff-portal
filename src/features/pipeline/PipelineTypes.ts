export type PipelineStage =
  | "requires_docs"
  | "review"
  | "ready_for_lender"
  | "submitted"
  | "funded";

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
}

export type Pipeline = Record<PipelineStage, PipelineCard[]>;
