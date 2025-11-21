import http from "../lib/api/http";

export const ApplicationsAPI = {
  list: () => http.get("/api/applications"),
  get: (id: string) => http.get(`/api/applications/${id}`),
  create: (data: any) => http.post("/api/applications", data),
  update: (id: string, data: any) => http.put(`/api/applications/${id}`, data),
  remove: (id: string) => http.delete(`/api/applications/${id}`),
};
