import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Silo = "BF" | "BI" | "SLF";

interface SiloContextType {
  silo: Silo;
  setSilo: (s: Silo) => void;
}

const SiloContext = createContext<SiloContextType | undefined>(undefined);

export function SiloProvider({ children }: { children: ReactNode }) {
  const [silo, setSilo] = useState<Silo>("BF");

  return <SiloContext.Provider value={{ silo, setSilo }}>{children}</SiloContext.Provider>;
}

export function useSilo() {
  const ctx = useContext(SiloContext);
  if (!ctx) throw new Error("SiloProvider missing");
  return ctx;
}

export default SiloContext;
export type { Silo, SiloContextType };
