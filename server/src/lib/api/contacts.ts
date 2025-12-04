import { get } from "./base";
import { useAuthStore } from "@/state/authStore";

export async function fetchContacts() {
  const token = useAuthStore.getState().token;
  const data = await get("/api/contacts", token);
  // backend may wrap in { data: [...] } or be a plain list
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}
