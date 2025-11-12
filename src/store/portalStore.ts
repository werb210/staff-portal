import { create } from 'zustand';
import type { PortalModule } from '../types/rbac';

interface OfflineMutation {
  id: string;
  endpoint: string;
  payload: unknown;
  method: 'post' | 'put' | 'patch';
}

interface PortalState {
  sidebarOpen: boolean;
  activeModule: PortalModule;
  offlineQueue: OfflineMutation[];
  toggleSidebar: () => void;
  setActiveModule: (module: PortalModule) => void;
  queueOfflineMutation: (mutation: OfflineMutation) => void;
  clearOfflineMutation: (id: string) => void;
  resetQueue: () => void;
}

const defaultSidebarState = typeof window === 'undefined' ? true : window.innerWidth > 1024;

export const usePortalStore = create<PortalState>((set) => ({
  sidebarOpen: defaultSidebarState,
  activeModule: 'dashboard',
  offlineQueue: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveModule: (module) => set({ activeModule: module }),
  queueOfflineMutation: (mutation) =>
    set((state) => ({ offlineQueue: [...state.offlineQueue, mutation] })),
  clearOfflineMutation: (id) =>
    set((state) => ({ offlineQueue: state.offlineQueue.filter((item) => item.id !== id) })),
  resetQueue: () => set({ offlineQueue: [] }),
}));
