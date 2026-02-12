import { env } from "@/config/env";

export const getApiBaseUrl = (): string => String(env.VITE_API_BASE_URL ?? "");
