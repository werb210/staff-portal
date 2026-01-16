import type { DragEndEvent } from "@dnd-kit/core";

export type PipelineStageId =
  | "new"
  | "requires_docs"
  | "startup"
  | "in_review"
  | "lender"
  | "accepted"
  | "declined";

export type PipelineStage = {
  id: PipelineStageId;
  label: string;
  description?: string;
  terminal?: boolean;
  acceptsCategory?: string;
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
  matchPercentage?: number;
  matchPercent?: number;
  matchScore?: number;
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
  { id: "new", label: "New", description: "Fresh submissions" },
  { id: "requires_docs", label: "Requires Docs", description: "Waiting on applicant documents" },
  { id: "startup", label: "Start-Up", description: "Start-up category only", acceptsCategory: "startup" },
  { id: "in_review", label: "In Review", description: "Team reviewing application" },
  { id: "lender", label: "Lender", description: "With lender" },
  { id: "accepted", label: "Accepted", description: "Approved funding", terminal: true },
  { id: "declined", label: "Declined", description: "Closed out", terminal: true }
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
  if (toStage === "startup") {
    return card.productCategory.toLowerCase() === "startup";
  }
  return true;
};
