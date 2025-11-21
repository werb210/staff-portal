import apiClient from "@/lib/apiClient";

export const TagsAPI = {
  list: () => apiClient.get("/api/tags"),
  create: (data: any) => apiClient.post("/api/tags", data),
  delete: (id: string) => apiClient.delete(`/api/tags/${id}`),
};
