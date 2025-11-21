import apiClient from "../api";

export interface SettingsPayload {
  notifications?: boolean;
  timezone?: string;
  locale?: string;
  theme?: "light" | "dark" | "system";
}

export const getSettings = <T = unknown>() => apiClient.get<T>("/settings");

export const updateSettings = <T = unknown>(payload: Partial<SettingsPayload>) =>
  apiClient.patch<T>("/settings", payload);
