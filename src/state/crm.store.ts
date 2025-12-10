import { create } from "zustand";

type Silo = "BF" | "BI" | "SLF";

type CrmFilters = {
  search: string;
  owner: string | null;
  hasActiveApplication: boolean;
};

type CrmState = {
  silo: Silo;
  filters: CrmFilters;
  setSilo: (silo: Silo) => void;
  setFilters: (filters: Partial<CrmFilters>) => void;
  resetFilters: () => void;
};

const defaultFilters: CrmFilters = {
  search: "",
  owner: null,
  hasActiveApplication: false
};

export const useCrmStore = create<CrmState>((set) => ({
  silo: "BF",
  filters: defaultFilters,
  setSilo: (silo) => set({ silo }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters })
}));

export type { CrmFilters, CrmState, Silo };
