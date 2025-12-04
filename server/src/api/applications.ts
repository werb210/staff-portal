import { http } from "@/lib/api/http";

export const ApplicationsAPI = {
  list: () => http.get("/applications"),
  getById: (id: string) => http.get(`/applications/${id}`),
};
