import { apiClient } from "./httpClient";
import type { AdminUser, BrandingSettingsState, LoginHistoryEntry, ProfileSettings, SiloAccess, SiloCode } from "@/state/settings.store";

export const fetchProfile = () => apiClient.get<ProfileSettings>("/users/me");
export const updateProfile = (payload: Partial<ProfileSettings>) =>
  apiClient.patch<ProfileSettings>("/users/me", payload);

export const changePassword = (payload: { currentPassword: string; newPassword: string }) =>
  apiClient.patch<void>("/users/me/password", payload);

export const toggleTwoFactor = (payload: { enabled: boolean }) =>
  apiClient.patch<void>("/users/me/2fa", payload);

export const fetchLoginHistory = () => apiClient.get<LoginHistoryEntry[]>("/users/me/logins");

export const updateMeetingLink = (payload: { meetingLink: string }) =>
  apiClient.patch<void>("/users/me/meeting-link", payload);

export const updateDefaultSilo = (payload: { defaultSilo: SiloCode }) =>
  apiClient.patch<void>("/users/me/silo", payload);

export const fetchSilos = () => apiClient.get<SiloAccess[]>("/silos");

export const uploadFavicon = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.patch<BrandingSettingsState>("/branding/favicon", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const fetchAdminUsers = () => apiClient.get<AdminUser[]>("/admin/users");
export const createAdminUser = (payload: Omit<AdminUser, "id">) =>
  apiClient.post<AdminUser>("/admin/users", payload);
export const updateAdminUser = (id: string, payload: Partial<AdminUser>) =>
  apiClient.patch<AdminUser>(`/admin/users/${id}`, payload);
export const deleteAdminUser = (id: string) => apiClient.delete<void>(`/admin/users/${id}`);
