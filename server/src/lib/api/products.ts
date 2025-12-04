import { api } from "@/lib/apiClient";
import { httpGet } from "@/lib/http";
import { getToken } from "@/utils/token";

export async function fetchProducts() {
  return httpGet(api.url("/api/products"), getToken());
}
