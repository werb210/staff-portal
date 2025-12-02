import { create } from "zustand";
import { globalSearch } from "../api/search";

interface S {
  open: boolean;
  query: string;
  loading: boolean;
  results: any[];
  setOpen(open: boolean): void;
  setQuery(q: string): void;
  search(q: string): Promise<void>;
}

export const useSearchStore = create<S>((set, get) => ({
  open: false,
  query: "",
  loading: false,
  results: [],

  setOpen(open) {
    set({ open });
    if (!open) set({ query: "", results: [] });
  },

  setQuery(q) {
    set({ query: q });
  },

  async search(q) {
    set({ loading: true });
    const data = await globalSearch(q);
    set({ results: data, loading: false });
  },
}));
