export interface PipelineApplication {
  id: string;
  name: string;
  amountRequested?: number;
  updatedAt?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  applications?: PipelineApplication[];
}

export interface PipelineTransitionPayload {
  applicationId: string;
  fromStageId: string;
  toStageId: string;
}

export interface PipelineReorderPayload {
  stageOrder: string[];
}
