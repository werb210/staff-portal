import axios from "axios";
import { getApiBaseUrl } from "./env";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function checkStaffServerHealth() {
  const res = await api.get("/health");
  return res.data;
}
