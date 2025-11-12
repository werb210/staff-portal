import { create } from 'zustand';

interface PortalState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPipelineStage: string;
  setPipelineStage: (stage: string) => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  currentPipelineStage: 'New',
  setPipelineStage: (stage: string) => set({ currentPipelineStage: stage }),
}));
