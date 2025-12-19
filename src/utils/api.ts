import axios from "axios";
import { API_BASE_URL } from "./env";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function checkStaffServerHealth() {
  const res = await api.get("/health");
  return res.data;
}
