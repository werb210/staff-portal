import { create } from "zustand";
import type { QueryClient } from "@tanstack/react-query";
import type { PipelineFilters, PipelineStageId, PipelineApplication, PipelineDragEndEvent } from "./pipeline.types";
import { PIPELINE_STAGES, canMoveCardToStage } from "./pipeline.types";
import { pipelineApi } from "./pipeline.api";

export type PipelineStoreState = {
  selectedApplicationId: string | null;
  draggingCardId: string | null;
  draggingFromStage: PipelineStageId | null;
  currentFilters: PipelineFilters;
};

const defaultFilters: PipelineFilters = {
  docsStatus: "all",
  bankingComplete: null,
  ocrComplete: null,
  sort: "newest"
};

export type PipelineStoreActions = {
  setSelectedApplicationId: (id: string | null) => void;
  setDragging: (cardId: string | null, stageId: PipelineStageId | null) => void;
  setFilters: (filters: Partial<PipelineFilters>) => void;
  resetFilters: () => void;
};

export type PipelineStore = PipelineStoreState & PipelineStoreActions;

export const usePipelineStore = create<PipelineStore>((set) => ({
  selectedApplicationId: null,
  draggingCardId: null,
  draggingFromStage: null,
  currentFilters: { ...defaultFilters },
  setSelectedApplicationId: (id) => set({ selectedApplicationId: id }),
  setDragging: (cardId, stageId) => set({ draggingCardId: cardId, draggingFromStage: stageId }),
  setFilters: (filters) =>
    set((state) => ({
      currentFilters: { ...state.currentFilters, ...filters }
    })),
  resetFilters: () => set({ currentFilters: { ...defaultFilters } })
}));

const filterKeyParts = (filters: PipelineFilters) => [
  filters.searchTerm ?? "",
  filters.productCategory ?? "",
  filters.assignedStaffId ?? "",
  filters.dateFrom ?? "",
  filters.dateTo ?? "",
  filters.docsStatus ?? "all",
  filters.bankingComplete ?? "any",
  filters.ocrComplete ?? "any",
  filters.sort ?? "newest"
];

export const pipelineQueryKeys = {
  column: (stage: PipelineStageId, filters: PipelineFilters) => ["pipeline", stage, ...filterKeyParts(filters)]
};

const getStageFromId = (stageId: PipelineStageId) => PIPELINE_STAGES.find((stage) => stage.id === stageId);

export const createPipelineDragEndHandler = (options: {
  queryClient: QueryClient;
  filters: PipelineFilters;
}) => {
  const { queryClient, filters } = options;
  return async (event: PipelineDragEndEvent) => {
    const destinationStageId = event.over?.id as PipelineStageId | undefined;
    const sourceStageId = event.active.data.current?.stageId ?? null;
    const card = event.active.data.current?.card ?? null;
    if (!destinationStageId || !card || !sourceStageId) return;

    const destinationStage = getStageFromId(destinationStageId);
    if (!destinationStage) return;

    if (!canMoveCardToStage(card, sourceStageId, destinationStageId)) return;

    await pipelineApi.moveCard(card.id, destinationStageId);

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: pipelineQueryKeys.column(sourceStageId, filters) }),
      queryClient.invalidateQueries({ queryKey: pipelineQueryKeys.column(destinationStageId, filters) }),
      queryClient.invalidateQueries({ queryKey: ["applications", card.id, "details"] }),
      queryClient.invalidateQueries({ queryKey: ["applications", card.id, "audit"] })
    ]);
  };
};

export const createPipelineDragStartHandler = (setDragging: PipelineStoreActions["setDragging"]) => (cardId: string, stageId: PipelineStageId) => {
  setDragging(cardId, stageId);
};

export const clearDraggingState = (setDragging: PipelineStoreActions["setDragging"]) => () => setDragging(null, null);

export type { PipelineApplication };
