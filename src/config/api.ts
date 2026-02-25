import { ENV } from "@/config/env";

export const getApiBaseUrl = (): string => String(ENV.API_BASE_URL ?? "");
