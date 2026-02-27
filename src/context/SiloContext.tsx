import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import type { Silo } from "../types/silo";

interface SiloContextType {
  silo: Silo;
  setSilo: (s: Silo) => void;
}

const SiloContext = createContext<SiloContextType | undefined>(undefined);

export function SiloProvider({ children }: { children: ReactNode }) {
  const [silo, setSilo] = useState<Silo>("bf");
  const { allowedSilos, canAccessSilo } = useAuth();

  useEffect(() => {
    if (!allowedSilos.length) return;
    if (!canAccessSilo(silo)) {
      const nextSilo = allowedSilos[0];
      if (nextSilo) setSilo(nextSilo);
    }
  }, [allowedSilos, canAccessSilo, silo]);

  return <SiloContext.Provider value={{ silo, setSilo }}>{children}</SiloContext.Provider>;
}

export function useSilo() {
  const ctx = useContext(SiloContext);
  if (!ctx) throw new Error("SiloProvider missing");
  return ctx;
}

export default SiloContext;
export type { SiloContextType };
