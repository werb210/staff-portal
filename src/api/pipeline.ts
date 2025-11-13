// -----------------------------------------------------
// FINAL PIPELINE API CLIENT (FULLY ALIGNED WITH BACKEND)
// Server routes (from your Express router):
//   GET    /api/pipeline/stages
//   GET    /api/pipeline/cards
//   PUT    /api/pipeline/cards/:id/move
//   GET    /api/pipeline/cards/:id/application
//   GET    /api/pipeline/cards/:id/documents
//   GET    /api/pipeline/cards/:id/lenders
// -----------------------------------------------------

import { apiClient } from "./client";

// -----------------------------------------------------
// CANONICAL PIPELINE STAGES (match server exactly)
// -----------------------------------------------------
export type PipelineStage =
  | "New"
  | "Requires Docs"
  | "In Review"
  | "Sent to Lenders"
  | "Approved"
  | "Declined";

// -----------------------------------------------------
// PIPELINE CARD
// -----------------------------------------------------
export interface PipelineCard {
  id: string;
  applicationId: string;
  applicantName: string;
  amount: number;
  stage: PipelineStage;
  updatedAt: string;
  assignedTo?: string;
}

// -----------------------------------------------------
// COLUMN (server returns board → array of these)
// -----------------------------------------------------
export interface PipelineColumn {
  id: string;
  name: PipelineStage;
  stage: PipelineStage;
  position: number;
  count: number;
  totalLoanAmount: number;
  averageScore?: number;
  lastUpdatedAt: string;
  cards: PipelineCard[];
}

// -----------------------------------------------------
// MOVE CARD INPUT
// -----------------------------------------------------
export interface PipelineMoveInput {
  applicationId: string;
  toStage: PipelineStage;
  fromStage?: PipelineStage;
  assignedTo?: string;
  note?: string;
}

// -----------------------------------------------------
// NORMALIZE STAGE INPUTS FROM UI
// -----------------------------------------------------
const normalizeStage = (s: unknown): PipelineStage => {
  if (!s || typeof s !== "string") return "New";
  const v = s.trim().toLowerCase();

  if (v.includes("require")) return "Requires Docs";
  if (v.includes("review")) return "In Review";
  if (v.includes("lender")) return "Sent to Lenders";
  if (v.includes("approve")) return "Approved";
  if (v.includes("decline") || v.includes("reject")) return "Declined";

  return "New";
};

// -----------------------------------------------------
// FETCH BOARD (all columns)
// -----------------------------------------------------
export const getPipelineStages = async (): Promise<PipelineColumn[]> => {
  const res = await apiClient.get<{ data: PipelineColumn[] }>("/pipeline/stages");
  return res.data.data;
};

// -----------------------------------------------------
// FETCH ALL CARDS (not used by board, but drawer)
// -----------------------------------------------------
export const getPipelineCards = async (): Promise<PipelineCard[]> => {
  const res = await apiClient.get<{ data: PipelineCard[] }>("/pipeline/cards");
  return res.data.data;
};

// -----------------------------------------------------
// MOVE CARD (Drag & Drop)
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

  const res = await apiClient.put<{ data: PipelineCard }>(
    `/pipeline/cards/${input.applicationId}/move`,
    payload
  );

  return res.data.data;
};

// -----------------------------------------------------
// DRAWER: APPLICATION TAB
// -----------------------------------------------------
export const getPipelineApplication = async (id: string) => {
  const res = await apiClient.get(`/pipeline/cards/${id}/application`);
  return res.data.data;
};

// -----------------------------------------------------
// DRAWER: DOCUMENTS TAB
// -----------------------------------------------------
export const getPipelineDocuments = async (id: string) => {
  const res = await apiClient.get(`/pipeline/cards/${id}/documents`);
  return res.data.data;
};

// -----------------------------------------------------
// DRAWER: LENDERS TAB
// -----------------------------------------------------
export const getPipelineLenders = async (id: string) => {
  const res = await apiClient.get(`/pipeline/cards/${id}/lenders`);
  return res.data.data;
};

// -----------------------------------------------------
// DRAWER: AI SUMMARY
// -----------------------------------------------------
export const getPipelineAISummary = async (id: string) => {
  // backend route exists as: /pipeline/cards/:id/ai-summary (optional)
  const res = await apiClient.get(`/pipeline/cards/${id}/ai-summary`).catch(() => ({
    data: { data: null },
  }));
  return res.data.data;
};
