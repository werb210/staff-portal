import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPipelineStages,
  getPipelineApplication,
  getPipelineDocuments,
  getPipelineLenders,
  movePipelineCard,
  type PipelineStage,
  type PipelineCard,
} from "../api/pipeline";

const PIPELINE_KEY = ["pipeline"];

/**
 * Load the full board (canonical stages + cards)
 * Backend: GET /api/pipeline/stages
 */
export const usePipelineBoard = () =>
  useQuery({
    queryKey: PIPELINE_KEY,
    queryFn: getPipelineStages,
  });

/**
 * Load a single application drawer
 * Backend: GET /api/pipeline/cards/:id/application
 */
export const usePipelineApplication = (id: string) =>
  useQuery<PipelineCard>({
    queryKey: [...PIPELINE_KEY, id, "application"],
    queryFn: () => getPipelineApplication(id),
    enabled: Boolean(id),
  });

/**
 * Drawer → Documents tab
 * Backend: GET /api/pipeline/cards/:id/documents
 */
export const usePipelineDocuments = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, "documents"],
    queryFn: () => getPipelineDocuments(id),
    enabled: Boolean(id),
  });

/**
 * Drawer → Lenders tab
 * Backend: GET /api/pipeline/cards/:id/lenders
 */
export const usePipelineLenders = (id: string) =>
  useQuery({
    queryKey: [...PIPELINE_KEY, id, "lenders"],
    queryFn: () => getPipelineLenders(id),
    enabled: Boolean(id),
  });

/**
 * Pipeline Mutations
 */
export const usePipelineMutations = () => {
  const qc = useQueryClient();

  /**
   * Stage transition
   * Backend: PUT /api/pipeline/cards/:id/move
   *
   * Payload shape (canonical):
   * {
   *   applicationId: string;
   *   fromStage?: string | null;
   *   toStage: string;     ← must be canonical stage name ("New", "In Review", etc.)
   *   assignedTo?: string;
   *   note?: string;
   * }
   */
  const stageMutation = useMutation({
    mutationFn: async (payload: {
      applicationId: string;
      fromStage?: string | null;
      toStage: string;
    }) => {
      return movePipelineCard(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PIPELINE_KEY });
    },
  });

  return { stageMutation };
};

export type { PipelineStage, PipelineCard };
