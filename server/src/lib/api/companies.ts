import { api } from "@/lib/apiClient";
import { httpGet } from "@/lib/http";
import { getToken } from "@/utils/token";

export async function fetchCompanies() {
  return httpGet(api.url("/api/companies"), getToken());
}
