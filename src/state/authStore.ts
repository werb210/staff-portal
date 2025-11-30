import { create } from 'zustand';
import { api } from '../api/client';
import { Silo, useSiloStore } from './siloStore';
import { User } from '../types/User';

interface AuthState {
  user: User | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  setUser: (u) => set({ user: u }),

  login: async (email, password) => {
    set({ loading: true });
    const client = api();

    try {
      const res = await client.post('/auth/login', { email, password });

      const user: User = res.data.user;

      // Set user
      set({ user, loading: false });

      // Configure silo store
      const allSilos = user.silos || [];
      const roles = user.roles || {};

      useSiloStore.getState().setAllowed(allSilos as Silo[]);
      useSiloStore.getState().setRoles(roles);

      // Default silo = first allowed
      if (allSilos.length > 0) {
        useSiloStore.getState().setSilo(allSilos[0] as Silo);
      }
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      const client = api();
      await client.post('/auth/logout');
    } catch (err) {}

    set({ user: null, loading: false });
    useSiloStore.getState().setSilo(null);
  },
}));
