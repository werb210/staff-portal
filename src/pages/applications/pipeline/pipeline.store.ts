import { create } from "zustand";
import type { QueryClient } from "@tanstack/react-query";
import type { PipelineFilters, PipelineStageId, PipelineApplication, PipelineDragEndEvent } from "./pipeline.types";
import { PIPELINE_STAGES, canMoveCardToStage } from "./pipeline.types";
import { pipelineApi } from "./pipeline.api";
const STORAGE_KEY = "portal.application.pipeline";

type PipelinePersistedState = {
  selectedStageId?: PipelineStageId | null;
  selectedApplicationId?: string | null;
  filters?: PipelineFilters;
  isDrawerOpen?: boolean;
};

const readPipelineState = (): PipelinePersistedState => {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as PipelinePersistedState;
  } catch {
    return {};
  }
};

const writePipelineState = (draft: PipelinePersistedState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

const persistPipelineState = (state: PipelineStoreState) => {
  writePipelineState({
    selectedStageId: state.selectedStageId,
    selectedApplicationId: state.selectedApplicationId,
    filters: state.currentFilters,
    isDrawerOpen: state.isDrawerOpen
  });
};

const clearPipelineState = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export type PipelineStoreState = {
  selectedApplicationId: string | null;
  selectedStageId: PipelineStageId | null;
  isDrawerOpen: boolean;
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

const getInitialFilters = (): PipelineFilters => {
  const stored = readPipelineState().filters ?? {};
  return { ...defaultFilters, ...stored };
};

const getInitialStageId = (): PipelineStageId => readPipelineState().selectedStageId ?? "received";

const getInitialSelectedApplicationId = (): string | null => readPipelineState().selectedApplicationId ?? null;

const getInitialDrawerState = (selectedApplicationId: string | null): boolean =>
  readPipelineState().isDrawerOpen ?? Boolean(selectedApplicationId);

export type PipelineStoreActions = {
  selectApplication: (id: string | null, stageId?: PipelineStageId) => void;
  setSelectedStageId: (stageId: PipelineStageId) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDragging: (cardId: string | null, stageId: PipelineStageId | null) => void;
  setFilters: (filters: Partial<PipelineFilters>) => void;
  resetFilters: () => void;
  resetPipeline: () => void;
};

export type PipelineStore = PipelineStoreState & PipelineStoreActions;

export const usePipelineStore = create<PipelineStore>((set) => {
  const initialSelectedApplicationId = getInitialSelectedApplicationId();
  return {
    selectedApplicationId: initialSelectedApplicationId,
    selectedStageId: getInitialStageId(),
    isDrawerOpen: getInitialDrawerState(initialSelectedApplicationId),
    draggingCardId: null,
    draggingFromStage: null,
    currentFilters: getInitialFilters(),
    selectApplication: (id, stageId) =>
      set((state) => {
        const nextState = {
          ...state,
          selectedApplicationId: id,
          selectedStageId: stageId ?? state.selectedStageId,
          isDrawerOpen: Boolean(id)
        };
        persistPipelineState(nextState);
        return nextState;
      }),
    setSelectedStageId: (stageId) =>
      set((state) => {
        const nextState = { ...state, selectedStageId: stageId };
        persistPipelineState(nextState);
        return nextState;
      }),
    openDrawer: () =>
      set((state) => {
        const nextState = { ...state, isDrawerOpen: Boolean(state.selectedApplicationId) };
        persistPipelineState(nextState);
        return nextState;
      }),
    closeDrawer: () =>
      set((state) => {
        const nextState = { ...state, isDrawerOpen: false };
        persistPipelineState(nextState);
        return nextState;
      }),
    setDragging: (cardId, stageId) => set({ draggingCardId: cardId, draggingFromStage: stageId }),
    setFilters: (filters) =>
      set((state) => {
        const nextFilters = { ...state.currentFilters, ...filters };
        const categoryChanged =
          Object.prototype.hasOwnProperty.call(filters, "productCategory") &&
          filters.productCategory !== state.currentFilters.productCategory;
        const nextState = {
          ...state,
          currentFilters: nextFilters,
          selectedApplicationId: categoryChanged ? null : state.selectedApplicationId,
          isDrawerOpen: categoryChanged ? false : state.isDrawerOpen
        };
        persistPipelineState(nextState);
        return nextState;
      }),
    resetFilters: () =>
      set((state) => {
        const nextState = {
          ...state,
          currentFilters: { ...defaultFilters },
          selectedApplicationId: null,
          selectedStageId: "received",
          isDrawerOpen: false
        };
        persistPipelineState(nextState);
        return nextState;
      }),
    resetPipeline: () => {
      clearPipelineState();
      set({
        selectedApplicationId: null,
        selectedStageId: "received",
        isDrawerOpen: false,
        draggingCardId: null,
        draggingFromStage: null,
        currentFilters: { ...defaultFilters }
      });
    }
  };
});

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
