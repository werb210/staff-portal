import axios from "axios";
import { getAuthToken } from "../utils/authToken";
import { API_BASE_URL } from "../utils/env";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((c) => {
  const t = getAuthToken();
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const fetchUsers = () => api.get("/api/roles").then((r) => r.data.data);
export const updateUserRole = (id: string, role: string) =>
  api.post(`/api/roles/${id}/role`, { role }).then((r) => r.data.data);
export const toggleUserActive = (id: string, active: boolean) =>
  api.post(`/api/roles/${id}/active`, { active }).then((r) => r.data.data);
export const createUser = (payload: any) =>
  api.post("/api/roles/create", payload).then((r) => r.data.data);
export const resetPassword = (id: string, password: string) =>
  api.post(`/api/roles/${id}/reset-password`, { password }).then((r) => r.data.data);
