import { create } from "zustand";
import axios from "axios";

export interface PipelineApp {
  id: string;
  businessName: string;
  stage: string;
  primaryContact?: string;
  applicantName?: string;
  requestedAmount?: number;
  pipelineStage?: string;
}

interface PipelineState {
  apps: PipelineApp[];
  loading: boolean;

  loadPipeline: () => Promise<void>;
  byStage: (stageId: string) => PipelineApp[];
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  apps: [],
  loading: false,

  loadPipeline: async () => {
    set({ loading: true });

    try {
      const res = await axios.get("/api/pipeline");
      set({ apps: res.data.data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  byStage: (stageId) => {
    return get().apps.filter((a) => a.stage === stageId);
  },
}));
