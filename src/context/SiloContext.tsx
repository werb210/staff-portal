import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthContext";

export type Silo = "BF" | "BI" | "SLF";

const STORAGE_KEY = "staff-portal.silo";
const DEFAULT_SILO: Silo = "BF";

const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStoredSilo = (): Silo | null => {
  if (!canUseLocalStorage()) return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Silo | null;
    return stored ?? null;
  } catch {
    return null;
  }
};

export type SiloContextValue = {
  silo: Silo;
  setSilo: (silo: Silo) => void;
};

const SiloContext = createContext<SiloContextValue | undefined>(undefined);

export const SiloProvider = ({ children }: { children: React.ReactNode }) => {
  const { authStatus, user } = useAuth();
  const initialSilo = readStoredSilo();
  const [silo, setSilo] = useState<Silo>(() => initialSilo ?? DEFAULT_SILO);
  const hasStoredSilo = useRef(initialSilo !== null);

  useEffect(() => {
    if (!canUseLocalStorage()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, silo);
    } catch {
      // ignore storage errors
    }
  }, [silo]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (hasStoredSilo.current) return;
    const userSilo = (user as { silo?: Silo } | null)?.silo;
    if (!userSilo) return;
    setSilo(userSilo);
    hasStoredSilo.current = true;
  }, [authStatus, user]);

  const value = useMemo(() => ({ silo, setSilo }), [silo]);

  return <SiloContext.Provider value={value}>{children}</SiloContext.Provider>;
};

export default SiloContext;
