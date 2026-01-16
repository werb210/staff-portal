import type { DragEndEvent } from "@dnd-kit/core";

export type PipelineStageId =
  | "received"
  | "in_review"
  | "docs_required"
  | "additional_steps"
  | "off_to_lender"
  | "offer";

export type PipelineStage = {
  id: PipelineStageId;
  label: string;
  description?: string;
  terminal?: boolean;
};

export type PipelineFilters = {
  searchTerm?: string;
  productCategory?: string;
  assignedStaffId?: string;
  dateFrom?: string;
  dateTo?: string;
  docsStatus?: "all" | "complete" | "missing";
  bankingComplete?: boolean | null;
  ocrComplete?: boolean | null;
  sort?: "newest" | "oldest" | "highest_amount" | "lowest_amount";
};

export type PipelineApplication = {
  id: string;
  businessName: string;
  contactName: string;
  requestedAmount: number;
  productCategory: string;
  stage: PipelineStageId;
  status: string;
  matchPercentage?: number | string | null;
  matchPercent?: number | string | null;
  matchScore?: number | string | null;
  documents: {
    submitted: number;
    required: number;
  };
  bankingComplete: boolean;
  ocrComplete: boolean;
  assignedStaff?: string;
  createdAt: string;
};

export type PipelineStageColumns = Record<PipelineStageId, PipelineApplication[]>;

export type PipelineDragEndEvent = DragEndEvent & {
  active: DragEndEvent["active"] & {
    data: Required<DragEndEvent["active"]["data"]> & {
      current: {
        stageId: PipelineStageId;
        card: PipelineApplication;
      };
    };
  };
};

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "received", label: "Received", description: "Application received" },
  { id: "in_review", label: "In Review", description: "Team reviewing application" },
  { id: "docs_required", label: "Documents Required", description: "Waiting on applicant documents" },
  { id: "additional_steps", label: "Additional Steps", description: "Extra validation steps" },
  { id: "off_to_lender", label: "Off to Lender", description: "Application submitted to lender" },
  { id: "offer", label: "Offer", description: "Offer delivered", terminal: true }
];

export const PIPELINE_STAGE_LABELS: Record<PipelineStageId, string> = PIPELINE_STAGES.reduce(
  (acc, stage) => ({ ...acc, [stage.id]: stage.label }),
  {} as Record<PipelineStageId, string>
);

export const findPipelineStage = (stageId: PipelineStageId) =>
  PIPELINE_STAGES.find((stage) => stage.id === stageId);

export const isTerminalStage = (stageId: PipelineStageId) => findPipelineStage(stageId)?.terminal ?? false;

export const canMoveCardToStage = (
  card: PipelineApplication | null,
  fromStage: PipelineStageId | null,
  toStage: PipelineStageId | null
) => {
  if (!card || !fromStage || !toStage || fromStage === toStage) return false;
  if (isTerminalStage(fromStage)) return false;
  return true;
};
