import { api } from "@/lib/apiClient";

export const contactsApi = {
  list: () => api.get("/contacts"),
  get: (id: string) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post("/contacts", data),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data)
};
