import { create } from "zustand";
import {
  fetchUsers,
  updateUserRole,
  toggleUserActive,
  createUser,
  resetPassword,
} from "../api/roles";
import type { Role } from "./authStore";

type RoleUser = {
  id: string;
  email: string;
  role: Role;
  active: boolean;
  name?: string | null;
};

type RoleStore = {
  users: RoleUser[];
  load: () => Promise<void>;
  changeRole: (id: string, role: Role) => Promise<void>;
  toggleActive: (id: string, active: boolean) => Promise<void>;
  addUser: (payload: any) => Promise<void>;
  resetUserPassword: (id: string, password: string) => Promise<void>;
};

export const useRoleStore = create<RoleStore>((set, get) => ({
  users: [],

  async load() {
    const rows = await fetchUsers();
    set({ users: rows });
  },

  async changeRole(id, role) {
    await updateUserRole(id, role);
    await get().load();
  },

  async toggleActive(id, active) {
    await toggleUserActive(id, active);
    await get().load();
  },

  async addUser(payload) {
    await createUser(payload);
    await get().load();
  },

  async resetUserPassword(id, password) {
    await resetPassword(id, password);
    await get().load();
  },
}));
