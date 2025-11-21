import apiClient from "@/lib/apiClient";

export const UsersAPI = {
  list: () => apiClient.get("/api/users"),
  get: (id: string) => apiClient.get(`/api/users/${id}`),
  create: (data: any) => apiClient.post("/api/users", data),
  update: (id: string, data: any) => apiClient.put(`/api/users/${id}`, data),
  remove: (id: string) => apiClient.delete(`/api/users/${id}`),
};
