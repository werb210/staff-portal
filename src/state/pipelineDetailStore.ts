import { create } from "zustand";
import axios from "axios";

interface PipelineDetailState {
  app: any | null;
  loading: boolean;

  load: (id: string) => Promise<void>;
}

export const usePipelineDetailStore = create<PipelineDetailState>((set) => ({
  app: null,
  loading: false,

  load: async (id: string) => {
    set({ loading: true });

    try {
      const res = await axios.get(`/api/pipeline/${id}`);
      set({ app: res.data.data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },
}));
