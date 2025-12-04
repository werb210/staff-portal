import { http } from "@/lib/api/http";

export const ContactsAPI = {
  list: () => http.get("/contacts"),
};
