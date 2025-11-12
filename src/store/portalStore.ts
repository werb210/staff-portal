import { create } from 'zustand';

interface PortalState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
