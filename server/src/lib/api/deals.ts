import { api } from "@/lib/apiClient";
import { httpGet } from "@/lib/http";
import { getToken } from "@/utils/token";

export async function fetchDeals() {
  return httpGet(api.url("/api/deals"), getToken());
}
