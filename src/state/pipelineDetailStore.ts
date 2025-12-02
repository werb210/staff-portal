import { create } from "zustand";
import axios from "axios";

interface PipelineDetailState {
  app: any | null;
  banking: any | null;
  financials: any | null;
  ocrResults: any | null;
  loading: boolean;

  load: (id: string) => Promise<void>;
}

export const usePipelineDetailStore = create<PipelineDetailState>((set) => ({
  app: null,
  banking: null,
  financials: null,
  ocrResults: null,
  loading: false,

  load: async (id: string) => {
    set({ loading: true });

    try {
      const [appRes, bankingRes, ocrRes] = await Promise.all([
        axios.get(`/api/pipeline/${id}`),
        axios.get(`/api/pipeline/${id}/banking`),
        axios.get(`/api/pipeline/${id}/ocr`),
      ]);

      set({
        app: appRes.data.data,
        banking: bankingRes.data.data,
        ocrResults: ocrRes.data.data,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },
}));
