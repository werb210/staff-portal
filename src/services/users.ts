import api from "../lib/api";

export const UsersAPI = {
  list: () => api.get("/api/users"),
  get: (id: string) => api.get(`/api/users/${id}`),
  create: (data: any) => api.post("/api/users", data),
  update: (id: string, data: any) => api.put(`/api/users/${id}`, data),
  remove: (id: string) => api.delete(`/api/users/${id}`)
};
