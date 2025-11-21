import api from "../lib/api";

export const ApplicationsAPI = {
  list: () => api.get("/api/applications"),
  get: (id: string) => api.get(`/api/applications/${id}`),
  create: (data: any) => api.post("/api/applications", data),
  update: (id: string, data: any) => api.put(`/api/applications/${id}`, data),
  remove: (id: string) => api.delete(`/api/applications/${id}`)
};
