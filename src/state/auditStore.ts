import { create } from "zustand";
import { searchAuditLogs } from "../api/audit";

export interface AuditLogRow {
  id: number;
  eventType: string;
  userId: string | null;
  details: unknown;
  createdAt: string;
}

interface AuditFilters {
  eventType?: string;
  userId?: string;
  keyword?: string;
  from?: string;
  to?: string;
}

interface AuditState {
  rows: AuditLogRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: AuditFilters;
  load: () => Promise<void>;
  setFilters: (filters: AuditFilters) => void;
  setPage: (page: number) => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  rows: [],
  total: 0,
  page: 1,
  pageSize: 25,
  filters: {},

  async load() {
    const { filters, page, pageSize } = get();
    const data = await searchAuditLogs({ ...filters, page, pageSize });
    set({
      rows: data.rows,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
    });
  },

  setFilters(f: AuditFilters) {
    set({ filters: f, page: 1 });
    get().load();
  },

  setPage(p: number) {
    set({ page: p });
    get().load();
  },
}));
