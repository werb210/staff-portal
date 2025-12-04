import { http } from "@/lib/api/http";

export const CompaniesAPI = {
  list: () => http.get("/companies"),
};
