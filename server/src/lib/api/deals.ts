import { get } from "./base";
import { useAuthStore } from "@/state/authStore";

export async function fetchDeals() {
  const token = useAuthStore.getState().token;
  const data = await get("/api/deals", token);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}
