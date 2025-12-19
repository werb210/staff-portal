import axios from "axios";
import { RUNTIME_ENV } from "@/config/runtime";

export const api = axios.create({
  baseURL: RUNTIME_ENV.API_BASE_URL,
  withCredentials: true,
});

export async function checkStaffServerHealth() {
  const res = await api.get("/health");
  return res.data;
}
