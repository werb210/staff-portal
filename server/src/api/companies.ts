import { api } from "@/lib/apiClient";

export const companiesApi = {
  list: () => api.get("/companies"),
  get: (id: string) => api.get(`/companies/${id}`),
  create: (data: any) => api.post("/companies", data)
};
