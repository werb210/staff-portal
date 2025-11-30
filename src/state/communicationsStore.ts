import { create } from 'zustand';
import { api } from '../api/client';

interface Thread {
  applicationId: string;
  businessName: string;
  applicantName: string;
  lastMessage: string;
  lastSender: string;
  unread: number;
  updatedAt: string;
}

interface State {
  threads: Thread[];
  filter: "ALL" | "UNREAD" | "ACTIVE";
  setFilter: (f: State["filter"]) => void;

  load: () => Promise<void>;
  reloadThread: (applicationId: string) => Promise<void>;
}

export const useCommunicationsStore = create<State>((set, get) => ({
  threads: [],
  filter: "ALL",

  setFilter: (f) => set({ filter: f }),

  load: async () => {
    const client = api();
    const res = await client.get("/chat/threads");

    set({ threads: res.data });
  },

  reloadThread: async (applicationId) => {
    const client = api();
    const res = await client.get("/chat/threads");

    // Replace old list
    set({ threads: res.data });
  },
}));
