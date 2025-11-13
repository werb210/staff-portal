// -----------------------------------------------------
// FINAL, FULLY FIXED PIPELINE API CLIENT
// 100% aligned with backend:
//   GET  /api/pipeline/stages
//   GET  /api/pipeline/cards
//   PUT  /api/pipeline/cards/:id/move
//   GET  /api/pipeline/cards/:id/application
//   GET  /api/pipeline/cards/:id/documents
//   GET  /api/pipeline/cards/:id/lenders
//
// THIS FILE IS NOW CANONICAL.
// -----------------------------------------------------

import { apiClient } from "./client";

// Canonical stage names (must match backend exactly)
export type PipelineStage =
  | "New"
  | "Requires Docs"
  | "In Review"
  | "Sent to Lenders"
  | "Approved"
  | "Declined";

// Single card on the board
export interface PipelineCard {
  id: string; // applicationId = cardId
  applicationId: string;
  applicantName: string;
  amount: number;
  stage: PipelineStage;
  updatedAt: string;
  assignedTo?: string;
}

// Single pipeline column
export interface PipelineColumn {
  id: string;                 // stage name
  name: PipelineStage;        // column title
  stage: PipelineStage;       // duplicate for UI compatibility
  position: number;
  count: number;
  totalLoanAmount: number;
  averageScore?: number;
  lastUpdatedAt: string;
  cards: PipelineCard[];
}

// Move card payload
export interface PipelineMoveInput {
  applicationId: string;
  toStage: PipelineStage;
  fromStage?: PipelineStage;
  assignedTo?: string;
  note?: string;
}

// Convert any input → canonical stage
const normalizeStage = (s: unknown): PipelineStage => {
  if (!s || typeof s !== "string") return "New";

  const v = s.trim().toLowerCase();

  if (v.includes("require")) return "Requires Docs";
  if (v.includes("review")) return "In Review";
  if (v.includes("sent")) return "Sent to Lenders";
  if (v.includes("approve")) return "Approved";
  if (v.includes("declin") || v.includes("reject")) return "Declined";

  return "New";
};

// -----------------------------------------------------
// BOARD + CARD FETCHING
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
    fromStage: input.fromStage ? normalizeStage(input.fromStage) : undefined,
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
// APPLICATION DRAWER DATA
// -----------------------------------------------------

export const getPipelineApplication = async (id: string) => {
  const { data } = await apiClient.get<{ data: any }>(
    `/pipeline/cards/${id}/application`
  );
  return data.data;
};

export const getPipelineDocuments = async (id: string) => {
  const { data } = await apiClient.get<{ data: any }>(
    `/pipeline/cards/${id}/documents`
  );
  return data.data;
};

export const getPipelineLenders = async (id: string) => {
  const { data } = await apiClient.get<{ data: any }>(
    `/pipeline/cards/${id}/lenders`
  );
  return data.data;
};

// Removed getPipelineAISummary (backend does NOT have this route)
