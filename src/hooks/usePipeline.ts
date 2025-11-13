// -------------------------------------------------------------
// usePipeline.ts
// Canonical Staff Pipeline Hooks
// Matches backend:
//   GET /api/pipeline/stages
//   GET /api/pipeline/cards/:id/application
//   GET /api/pipeline/cards/:id/documents
//   GET /api/pipeline/cards/:id/lenders
//   GET /api/pipeline/cards/:id/ai-summary
//   PUT /api/pipeline/cards/:id/move
// -------------------------------------------------------------

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getPipelineStages,
  getPipelineApplication,
  getPipelineDocuments,
  getPipelineLenders,
  getPipelineAISummary,
  movePipelineCard,
  type PipelineStage,
  type PipelineCard,
} from "../api/pipeline";

const PIPELINE_KEY = ["pipeline"];

// -------------------------------------------------------------
// LOAD PIPELINE BOARD (Stages + Cards)
// Backend: GET /api/pipeline/stages
// -------------------------------------------------------------
export const usePipelineBoard = () =>
  useQuery({
    queryKey: PIPELINE_KEY,
    queryFn: getPipelineStages,
  });

// -------------------------------------------------------------
// LOAD APPLICATION (Drawer → Application Tab)
// Backend: GET /api/pipeline/cards/:id/application
// -------------------------------------------------------------
export const usePipelineApplication = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, "application"],
    queryFn: () => getPipelineApplication(id),
    enabled: Boolean(id),
  });

// -------------------------------------------------------------
// LOAD DOCUMENTS (Drawer → Documents Tab)
// Backend: GET /api/pipeline/cards/:id/documents
// -------------------------------------------------------------
export const usePipelineDocuments = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, "documents"],
    queryFn: () => getPipelineDocuments(id),
    enabled: Boolean(id),
  });

// -------------------------------------------------------------
// LOAD LENDERS (Drawer → Lenders Tab)
// Backend: GET /api/pipeline/cards/:id/lenders
// -------------------------------------------------------------
export const usePipelineLenders = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, "lenders"],
    queryFn: () => getPipelineLenders(id),
    enabled: Boolean(id),
  });

// -------------------------------------------------------------
// LOAD AI SUMMARY (Drawer → AI Summary Tab)
// Backend: GET /api/pipeline/cards/:id/ai-summary
// -------------------------------------------------------------
export const usePipelineAISummary = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, "ai-summary"],
    queryFn: () => getPipelineAISummary(id),
    enabled: Boolean(id),
  });

// -------------------------------------------------------------
// MUTATIONS → MOVE CARD BETWEEN STAGES
// Backend: PUT /api/pipeline/cards/:id/move
// -------------------------------------------------------------
export const usePipelineMutations = () => {
  const qc = useQueryClient();

  const stageMutation = useMutation({
    mutationFn: async (payload: {
      applicationId: string;
      fromStage?: string | null;
      toStage: string;
      assignedTo?: string;
      note?: string;
    }) => {
      return movePipelineCard(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PIPELINE_KEY });
    },
  });

  return { stageMutation };
};

// -------------------------------------------------------------
// EXPORT TYPES
// -------------------------------------------------------------
export type { PipelineStage, PipelineCard };
