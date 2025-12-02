import { create } from "zustand";
import { AuditFilter, AuditRecord, fetchAuditLogs } from "../api/audit";

type State = {
  records: AuditRecord[];
  loading: boolean;
  error: string | null;
  filter: AuditFilter;
  selected: AuditRecord | null;

  setFilter: (patch: Partial<AuditFilter>) => void;
  load: () => Promise<void>;
  select: (rec: AuditRecord | null) => void;
};

export const useAuditStore = create<State>((set, get) => ({
  records: [],
  loading: false,
  error: null,
  filter: {},
  selected: null,

  setFilter: (patch) => set({ filter: { ...get().filter, ...patch } }),

  select: (rec) => set({ selected: rec }),

  load: async () => {
    set({ loading: true, error: null });
    try {
      const { filter } = get();
      const rows = await fetchAuditLogs(filter);
      set({ records: rows, loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to load audit logs", loading: false });
    }
  },
}));
