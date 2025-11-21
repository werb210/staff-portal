import http from "@/lib/http";

export const UsersAPI = {
  list: () => http.get("/api/users"),
  get: (id: string) => http.get(`/api/users/${id}`),
  create: (data: any) => http.post("/api/users", data),
  update: (id: string, data: any) => http.put(`/api/users/${id}`, data),
  remove: (id: string) => http.delete(`/api/users/${id}`),
};
