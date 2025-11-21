import apiClient from "@/lib/apiClient";

export const ApplicationsAPI = {
  list: () => apiClient.get("/api/applications"),
  get: (id: string) => apiClient.get(`/api/applications/${id}`),
  create: (data: any) => apiClient.post("/api/applications", data),
  update: (id: string, data: any) => apiClient.put(`/api/applications/${id}`, data),
  remove: (id: string) => apiClient.delete(`/api/applications/${id}`),
};
