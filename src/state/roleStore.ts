import { create } from "zustand";
import {
  fetchUsers,
  updateUserRole,
  toggleUserActive,
  createUser,
  resetPassword,
} from "../api/roles";

export const useRoleStore = create((set, get) => ({
  users: [],

  async load() {
    const rows = await fetchUsers();
    set({ users: rows });
  },

  async changeRole(id: string, role: string) {
    await updateUserRole(id, role);
    await get().load();
  },

  async toggleActive(id: string, active: boolean) {
    await toggleUserActive(id, active);
    await get().load();
  },

  async addUser(payload: any) {
    await createUser(payload);
    await get().load();
  },

  async resetUserPassword(id: string, password: string) {
    await resetPassword(id, password);
    await get().load();
  },
}));
