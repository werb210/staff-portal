import { createContext, useEffect, useMemo, useState } from "react";

export type Silo = "BF" | "BI" | "SLF";

const STORAGE_KEY = "staff-portal.silo";
const DEFAULT_SILO: Silo = "BF";

const readStoredSilo = (): Silo => {
  const stored = localStorage.getItem(STORAGE_KEY) as Silo | null;
  return stored ?? DEFAULT_SILO;
};

export type SiloContextValue = {
  silo: Silo;
  setSilo: (silo: Silo) => void;
};

const SiloContext = createContext<SiloContextValue | undefined>(undefined);

export const SiloProvider = ({ children }: { children: React.ReactNode }) => {
  const [silo, setSilo] = useState<Silo>(() => readStoredSilo());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, silo);
  }, [silo]);

  const value = useMemo(() => ({ silo, setSilo }), [silo]);

  return <SiloContext.Provider value={value}>{children}</SiloContext.Provider>;
};

export default SiloContext;
