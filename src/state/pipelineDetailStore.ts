import { create } from "zustand";
import axios from "axios";
import { DocumentRecord } from "@/types/Documents";

interface PipelineDetailState {
  app: any | null;
  banking: any | null;
  financials: any | null;
  ocrResults: any | null;
  documents: DocumentRecord[] | null;
  currentId: string | null;
  loading: boolean;

  load: (id: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

export const usePipelineDetailStore = create<PipelineDetailState>((set, get) => ({
  app: null,
  banking: null,
  financials: null,
  ocrResults: null,
  documents: null,
  currentId: null,
  loading: false,

  load: async (id: string) => {
    set({ loading: true, currentId: id });

    try {
      const [appRes, bankingRes, ocrRes, docsRes] = await Promise.all([
        axios.get(`/api/pipeline/${id}`),
        axios.get(`/api/pipeline/${id}/banking`),
        axios.get(`/api/pipeline/${id}/ocr`),
        axios.get(`/api/pipeline/${id}/documents`),
      ]);

      set({
        app: appRes.data.data,
        banking: bankingRes.data.data,
        ocrResults: ocrRes.data.data,
        documents: docsRes.data.data,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  refreshDocuments: async () => {
    const id = get().currentId;
    if (!id) return;

    try {
      const docsRes = await axios.get(`/api/pipeline/${id}/documents`);
      set({ documents: docsRes.data.data });
    } catch (err) {
      console.error(err);
    }
  },
}));
