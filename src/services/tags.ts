import api from "../lib/api";

export const TagsAPI = {
  list: () => api.get("/api/tags"),
  create: (data: any) => api.post("/api/tags", data),
  delete: (id: string) => api.delete(`/api/tags/${id}`)
};
