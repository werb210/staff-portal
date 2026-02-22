import { createContext } from "react";
import type { ReactNode } from "react";
import { BusinessUnitProvider } from "@/context/BusinessUnitContext";
import { DEFAULT_BUSINESS_UNIT, type BusinessUnit } from "@/types/businessUnit";

export type Silo = BusinessUnit;

export type SiloContextValue = {
  silo: Silo;
  setSilo: (silo: Silo) => void;
};

const SiloContext = createContext<SiloContextValue | undefined>(undefined);

export const SiloProvider = ({ children }: { children: ReactNode }) => (
  <BusinessUnitProvider>{children}</BusinessUnitProvider>
);

export const DEFAULT_SILO: Silo = DEFAULT_BUSINESS_UNIT;

export default SiloContext;
