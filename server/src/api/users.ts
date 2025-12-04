import { http } from "@/lib/api/http";

export const UsersAPI = {
  list: () => http.get("/users"),
};
