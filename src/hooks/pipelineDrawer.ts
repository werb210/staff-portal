import { create } from "zustand";

interface PipelineDrawerState {
  isOpen: boolean;
  applicationId: string | null;
  open: (applicationId: string) => void;
  close: () => void;
}

export const usePipelineDrawer = create<PipelineDrawerState>((set) => ({
  isOpen: false,
  applicationId: null,
  open: (applicationId) => set({ isOpen: true, applicationId }),
  close: () => set({ isOpen: false, applicationId: null }),
}));
