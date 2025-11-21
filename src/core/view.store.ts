import { create } from "zustand";

type Timeframe = "7d" | "30d" | "90d";

interface PortalState {
  timeframe: Timeframe;
  searchTerm: string;
  setTimeframe: (timeframe: Timeframe) => void;
  setSearchTerm: (search: string) => void;
}

export const usePortalState = create<PortalState>((set) => ({
  timeframe: "30d",
  searchTerm: "",
  setTimeframe: (timeframe) => set({ timeframe }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
}));

export const getPortalState = () => usePortalState.getState();
