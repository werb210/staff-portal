import { create } from "zustand";

import { fetchPipeline, moveApplication, PipelineStage } from "./pipeline.api";

type PipelineState = {
  stages: PipelineStage[];
  isLoading: boolean;
  error?: string;
  fetchPipeline: () => Promise<void>;
  moveCard: (input: MoveCardInput) => Promise<void>;
};

type MoveCardInput = {
  applicationId: string;
  sourceStageId: string;
  destinationStageId: string;
  destinationIndex: number;
};

const reorderStages = (stages: PipelineStage[], move: MoveCardInput): PipelineStage[] => {
  const nextStages = stages.map((stage) => ({
    ...stage,
    applications: [...stage.applications],
  }));

  const sourceStage = nextStages.find((stage) => stage.id === move.sourceStageId);
  const destinationStage = nextStages.find((stage) => stage.id === move.destinationStageId);

  if (!sourceStage || !destinationStage) return stages;

  const sourceIndex = sourceStage.applications.findIndex((application) => application.id === move.applicationId);
  if (sourceIndex === -1) return stages;

  const [removed] = sourceStage.applications.splice(sourceIndex, 1);
  removed.stageId = destinationStage.id;
  destinationStage.applications.splice(move.destinationIndex, 0, removed);

  return nextStages;
};

export const usePipelineStore = create<PipelineState>((set, get) => ({
  stages: [],
  isLoading: false,
  error: undefined,
  fetchPipeline: async () => {
    set({ isLoading: true, error: undefined });

    try {
      const response = await fetchPipeline();
      set({ stages: response.data.stages ?? [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load pipeline";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  moveCard: async (input) => {
    const previousStages = get().stages;
    const optimistic = reorderStages(previousStages, input);

    set({ stages: optimistic, error: undefined });

    try {
      await moveApplication(input.applicationId, {
        stageId: input.destinationStageId,
        position: input.destinationIndex,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to move application";
      set({ stages: previousStages, error: message });
      throw error;
    }
  },
}));
