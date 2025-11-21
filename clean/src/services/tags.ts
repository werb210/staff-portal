import http from "../lib/api/http";

export const TagsAPI = {
  list: () => http.get("/api/tags"),
  create: (data: any) => http.post("/api/tags", data),
  delete: (id: string) => http.delete(`/api/tags/${id}`),
};
