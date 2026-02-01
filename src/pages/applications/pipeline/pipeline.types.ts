import type { DragEndEvent } from "@dnd-kit/core";

export type PipelineStageId = string;

export type PipelineStage = {
  id: PipelineStageId;
  label: string;
  description?: string;
  terminal?: boolean;
  allowedTransitions?: PipelineStageId[];
};

export type PipelineFilters = {
  searchTerm?: string;
  productCategory?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "newest" | "oldest" | "highest_amount" | "lowest_amount";
};

export type PipelineApplication = {
  id: string;
  businessName?: string;
  contactName?: string;
  requestedAmount?: number;
  productCategory?: string;
  stage: PipelineStageId;
  status?: string;
  matchPercentage?: number | string | null;
  matchPercent?: number | string | null;
  matchScore?: number | string | null;
  documents?: {
    submitted?: number;
    required?: number;
  };
  bankingComplete?: boolean;
  ocrComplete?: boolean;
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

export const PIPELINE_STAGE_ORDER = [
  "RECEIVED",
  "DOCUMENTS_REQUIRED",
  "IN_REVIEW",
  "START_UP",
  "OFF_TO_LENDER",
  "ACCEPTED",
  "DECLINED"
] as const;

export const PIPELINE_STAGE_LABELS: Record<(typeof PIPELINE_STAGE_ORDER)[number], string> = {
  RECEIVED: "Received",
  DOCUMENTS_REQUIRED: "Documents Required",
  IN_REVIEW: "In Review",
  START_UP: "Start Up",
  OFF_TO_LENDER: "Off to Lender",
  ACCEPTED: "Accepted",
  DECLINED: "Declined"
};

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = PIPELINE_STAGE_ORDER.map((id) => ({
  id,
  label: PIPELINE_STAGE_LABELS[id]
}));

export const sortPipelineStages = (stages: PipelineStage[]) => {
  if (!stages.length) return DEFAULT_PIPELINE_STAGES;
  const orderIndex = new Map(PIPELINE_STAGE_ORDER.map((id, index) => [id, index]));
  return stages
    .map((stage, index) => ({ stage, index }))
    .sort((a, b) => {
      const aOrder = orderIndex.has(a.stage.id) ? (orderIndex.get(a.stage.id) as number) : Number.POSITIVE_INFINITY;
      const bOrder = orderIndex.has(b.stage.id) ? (orderIndex.get(b.stage.id) as number) : Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.stage);
};

export const buildStageLabelMap = (stages: PipelineStage[]) =>
  stages.reduce(
    (acc, stage) => ({ ...acc, [stage.id]: stage.label }),
    {} as Record<PipelineStageId, string>
  );

export const getStageById = (stages: PipelineStage[], stageId: PipelineStageId) =>
  stages.find((stage) => stage.id === stageId);

type StageTransitionResult = {
  allowed: boolean;
  reason?: string;
};

const buildTransitionMessage = (nextStageLabel: string | undefined) =>
  nextStageLabel
    ? `Applications can only move to ${nextStageLabel} from here.`
    : "Applications can only move to the next stage from here.";

export const evaluateStageTransition = ({
  card,
  fromStage,
  toStage,
  stages
}: {
  card: PipelineApplication | null;
  fromStage: PipelineStageId | null;
  toStage: PipelineStageId | null;
  stages: PipelineStage[];
}): StageTransitionResult => {
  if (!card || !fromStage || !toStage || fromStage === toStage) {
    return { allowed: false };
  }

  const fromStageConfig = getStageById(stages, fromStage);
  if (!fromStageConfig) {
    return { allowed: false, reason: "Applications cannot be moved from an unknown stage." };
  }

  if (fromStageConfig.terminal) {
    return { allowed: false, reason: "Applications in terminal stages cannot be moved." };
  }

  if (fromStageConfig.allowedTransitions && fromStageConfig.allowedTransitions.length > 0) {
    return fromStageConfig.allowedTransitions.includes(toStage)
      ? { allowed: true }
      : { allowed: false, reason: "That stage change is not allowed." };
  }

  const fromIndex = PIPELINE_STAGE_ORDER.indexOf(fromStage as (typeof PIPELINE_STAGE_ORDER)[number]);
  const toIndex = PIPELINE_STAGE_ORDER.indexOf(toStage as (typeof PIPELINE_STAGE_ORDER)[number]);
  if (fromIndex === -1 || toIndex === -1) {
    return { allowed: false, reason: "That stage change is not supported." };
  }

  if (toIndex === fromIndex + 1) {
    return { allowed: true };
  }

  const nextStage = PIPELINE_STAGE_ORDER[fromIndex + 1];
  const nextStageLabel = nextStage ? buildStageLabelMap(stages)[nextStage] : undefined;
  return { allowed: false, reason: buildTransitionMessage(nextStageLabel) };
};
