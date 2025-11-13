// -----------------------------------------------------
// FIXED PIPELINE API CLIENT
// Fully aligned with backend:
//   GET    /api/pipeline/stages
//   GET    /api/pipeline/cards
//   PUT    /api/pipeline/cards/:id/move
//   GET    /api/pipeline/cards/:id/application
//   GET    /api/pipeline/cards/:id/documents
//   GET    /api/pipeline/cards/:id/lenders
// -----------------------------------------------------

import { apiClient } from "./client";

// Canonical pipeline stage names (match backend EXACTLY)
export type PipelineStage =
  | "New"
  | "Requires Docs"
  | "In Review"
  | "Sent to Lenders"
  | "Approved"
  | "Declined";

// A single card on the board
export interface PipelineCard {
  id: string;                // cardId = applicationId
  applicationId: string;
  applicantName: string;
  amount: number;
  stage: PipelineStage;
  updatedAt: string;
  assignedTo?: string;
}

// A single column on the pipeline board
export interface PipelineColumn {
  id: string;                // stage id (string)
  name: PipelineStage;
  stage: PipelineStage;
  position: number;
  count: number;
  totalLoanAmount: number;
  averageScore?: number;
  lastUpdatedAt: string;
  cards: PipelineCard[];
}

// Input for moving a pipeline card
export interface PipelineMoveInput {
  applicationId: string;
  toStage: PipelineStage;
  fromStage?: PipelineStage;
  assignedTo?: string;
  note?: string;
}

// Normalize text → canonical stage name
const normalizeStage = (s: unknown): PipelineStage => {
  if (!s || typeof s !== "string") return "New";

  const v = s.trim().toLowerCase();

  switch (v) {
    case "new":
    case "new application":
      return "New";

    case "requires docs":
    case "requires_documents":
    case "requiresdocuments":
      return "Requires Docs";

    case "in review":
    case "review":
      return "In Review";

    case "sent to lenders":
    case "sent to lender":
    case "ready_for_lenders":
    case "ready for lenders":
      return "Sent to Lenders";

    case "approved":
      return "Approved";

    case "declined":
    case "rejected":
      return "Declined";

    default:
      return "New";
  }
};

// -----------------------------------------------------
// FETCH BOARD + CARDS
// -----------------------------------------------------

export const getPipelineStages = async (): Promise<PipelineColumn[]> => {
  const { data } = await apiClient.get<{ data: PipelineColumn[] }>(
    "/pipeline/stages"
  );
  return data.data;
};

export const getPipelineCards = async (): Promise<PipelineCard[]> => {
  const { data } = await apiClient.get<{ data: PipelineCard[] }>(
    "/pipeline/cards"
  );
  return data.data;
};

// -----------------------------------------------------
// MOVE CARD
// -----------------------------------------------------

export const movePipelineCard = async (
  input: PipelineMoveInput
): Promise<PipelineCard> => {
  const payload = {
    applicationId: input.applicationId,
    fromStage: input.fromStage
      ? normalizeStage(input.fromStage)
      : undefined,
    toStage: normalizeStage(input.toStage),
    assignedTo: input.assignedTo,
    note: input.note,
  };

  const { data } = await apiClient.put<{ data: PipelineCard }>(
    `/pipeline/cards/${input.applicationId}/move`,
    payload
  );

  return data.data;
};

// -----------------------------------------------------
// APPLICATION DATA FOR DRAWER
// -----------------------------------------------------

export const getPipelineApplication = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/cards/${id}/application`);
  return data.data;
};

export const getPipelineDocuments = async (id: string) => {
  const { data } = await apiClient.get(
    `/pipeline/cards/${id}/documents`
  );
  return data.data;
};

export const getPipelineLenders = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/cards/${id}/lenders`);
  return data.data;
};

export const getPipelineAISummary = async (id: string) => {
  const { data } = await apiClient.get(
    `/pipeline/cards/${id}/ai-summary`
  );
  return data.data;
};
