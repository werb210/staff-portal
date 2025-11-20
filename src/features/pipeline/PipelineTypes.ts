export type PipelineStage =
  | "requires_docs"
  | "review"
  | "ready_for_lender"
  | "submitted"
  | "funded";

export interface PipelineCard {
  id: string;
  applicationId: string;
  businessName: string;
  contactName: string;
  amountRequested: number;
  productType: string;
  stage: PipelineStage;
  updatedAt: string;
}

export type Pipeline = Record<PipelineStage, PipelineCard[]>;
