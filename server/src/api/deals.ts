import { http } from "@/lib/api/http";

export const DealsAPI = {
  list: () => http.get("/deals"),
};
