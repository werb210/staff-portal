import { apiClient } from "./client";
import type { AdminUser, BrandingSettingsState, LoginHistoryEntry, ProfileSettings, SiloAccess, SiloCode } from "@/state/settings.store";

export const fetchProfile = () => apiClient.get<ProfileSettings>("/api/users/me");
export const updateProfile = (payload: Partial<ProfileSettings>) =>
  apiClient.patch<ProfileSettings>("/api/users/me", payload);

export const changePassword = (payload: { currentPassword: string; newPassword: string }) =>
  apiClient.patch<void>("/api/users/me/password", payload);

export const toggleTwoFactor = (payload: { enabled: boolean }) =>
  apiClient.patch<void>("/api/users/me/2fa", payload);

export const fetchLoginHistory = () => apiClient.get<LoginHistoryEntry[]>("/api/users/me/logins");

export const updateMeetingLink = (payload: { meetingLink: string }) =>
  apiClient.patch<void>("/api/users/me/meeting-link", payload);

export const updateDefaultSilo = (payload: { defaultSilo: SiloCode }) =>
  apiClient.patch<void>("/api/users/me/silo", payload);

export const fetchSilos = () => apiClient.get<SiloAccess[]>("/api/silos");

export const uploadFavicon = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.patch<BrandingSettingsState>("/api/branding/favicon", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const fetchAdminUsers = () => apiClient.get<AdminUser[]>("/api/admin/users");
export const createAdminUser = (payload: Omit<AdminUser, "id">) =>
  apiClient.post<AdminUser>("/api/admin/users", payload);
export const updateAdminUser = (id: string, payload: Partial<AdminUser>) =>
  apiClient.patch<AdminUser>(`/api/admin/users/${id}`, payload);
export const deleteAdminUser = (id: string) => apiClient.delete<void>(`/api/admin/users/${id}`);
