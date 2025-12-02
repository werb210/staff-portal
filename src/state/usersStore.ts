import { create } from "zustand";
import { UserRecord, UserInput, fetchUsers, createUser, updateUser, deleteUser } from "../api/users";

type State = {
  list: UserRecord[];
  loading: boolean;
  error: string | null;
  selected: UserRecord | null;
  editing: boolean;
  saving: boolean;

  load: () => Promise<void>;
  select: (u: UserRecord | null) => void;
  openEditor: (u: UserRecord | null) => void;
  closeEditor: () => void;
  save: (input: Partial<UserInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useUsersStore = create<State>((set, get) => ({
  list: [],
  loading: false,
  error: null,
  selected: null,
  editing: false,
  saving: false,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const rows = await fetchUsers();
      set({ list: rows, loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to load users", loading: false });
    }
  },

  select: (u) => set({ selected: u }),

  openEditor: (u) => set({ selected: u, editing: true }),

  closeEditor: () => set({ editing: false, selected: null }),

  save: async (input) => {
    set({ saving: true });
    const { selected } = get();

    try {
      if (!selected) {
        // create
        const created = await createUser(input as UserInput);
        set({ list: [...get().list, created], saving: false, editing: false, selected: null });
      } else {
        // update
        const updated = await updateUser(selected.id, input);
        const updatedList = get().list.map((u) => (u.id === selected.id ? updated : u));
        set({ list: updatedList, saving: false, editing: false, selected: null });
      }
    } catch (err: any) {
      set({ saving: false, error: err?.message ?? "Failed to save user" });
    }
  },

  remove: async (id) => {
    await deleteUser(id);
    set({ list: get().list.filter((u) => u.id !== id) });
  },
}));
