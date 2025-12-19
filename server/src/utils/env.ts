type RuntimeEnv = {
  API_BASE_URL: string;
  WS_URL?: string;
  API_BF?: string;
  API_BI?: string;
  API_SLF?: string;
};

type Silo = "BF" | "BI" | "SLF";

const env = (window as any).__ENV__ as RuntimeEnv | undefined;

if (!env?.API_BASE_URL) {
  throw new Error("API_BASE_URL missing (window.__ENV__)");
}

const normalizeBase = (value: string) => value.replace(/\/+$/, "");

export const API_BASE_URL = normalizeBase(env.API_BASE_URL);

export const WS_URL = (() => {
  const base = env.WS_URL ?? env.API_BASE_URL;
  if (base.startsWith("ws")) return normalizeBase(base);
  if (base.startsWith("http")) return normalizeBase(base.replace(/^http/, "ws"));
  return normalizeBase(base);
})();

export const SILO_API_BASES: Record<Silo, string> = {
  BF: normalizeBase(env.API_BF ?? env.API_BASE_URL),
  BI: normalizeBase(env.API_BI ?? env.API_BASE_URL),
  SLF: normalizeBase(env.API_SLF ?? env.API_BASE_URL)
};

export const getSiloApiBase = (silo: Silo | null | undefined) =>
  silo ? SILO_API_BASES[silo] ?? API_BASE_URL : API_BASE_URL;
