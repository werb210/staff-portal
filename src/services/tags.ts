import api from "@/lib/api/client";

export const TagsAPI = {
  list: () => api.get("/api/tags"),
  create: (data: any) => api.post("/api/tags", data),
  delete: (id: string) => api.delete(`/api/tags/${id}`)
};
