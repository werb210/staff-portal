import { apiClient } from "./httpClient";
import type { AdminUser, BrandingSettingsState, ProfileSettings } from "@/state/settings.store";

export const fetchProfile = () => apiClient.get<ProfileSettings>("/users/me");
export const updateProfile = (payload: Partial<ProfileSettings>) =>
  apiClient.patch<ProfileSettings>("/users/me", payload);

export const uploadFavicon = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.patch<BrandingSettingsState>("/branding/favicon", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const uploadLogo = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.patch<BrandingSettingsState>("/branding/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const fetchAdminUsers = () => apiClient.get<AdminUser[]>("/admin/users");
export const createAdminUser = (payload: Omit<AdminUser, "id">) =>
  apiClient.post<AdminUser>("/admin/users", payload);
export const updateAdminUser = (id: string, payload: Partial<AdminUser>) =>
  apiClient.patch<AdminUser>(`/admin/users/${id}`, payload);
export const deleteAdminUser = (id: string) => apiClient.delete<void>(`/admin/users/${id}`);
