import { create } from 'zustand';

export type Silo = "BF" | "BI" | "SLF";

interface SiloState {
  currentSilo: Silo | null;
  allowedSilos: Silo[];
  roles: Record<Silo, string>;
  setSilo: (silo: Silo) => void;
  setAllowed: (allowed: Silo[]) => void;
  setRoles: (roles: Record<Silo, string>) => void;
}

const defaultRoles: Record<Silo, string> = {
  BF: "",
  BI: "",
  SLF: "",
};

export const useSiloStore = create<SiloState>((set) => ({
  currentSilo: null,
  allowedSilos: [],
  roles: defaultRoles,

  setSilo: (silo) => set({ currentSilo: silo }),
  setAllowed: (allowed) => set({ allowedSilos: allowed }),
  setRoles: (roles) => set({ roles }),
}));
