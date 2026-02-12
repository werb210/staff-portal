import { env } from "@/config/env";

export const getApiBaseUrl = (): string => env.VITE_API_BASE_URL;
