import { api } from "@/lib/apiClient";

export const applicationsApi = {
  list: () => api.get("/applications"),
  get: (id: string) => api.get(`/applications/${id}`)
};
