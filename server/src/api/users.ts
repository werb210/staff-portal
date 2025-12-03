import axios from "axios";
import { getAuthToken } from "../utils/authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken?.();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "staff" | "marketing" | "lender" | "referrer";
  createdAt: string;
};

export type UserInput = {
  email: string;
  name?: string;
  password?: string;
  role: UserRecord["role"];
};

export async function fetchUsers(): Promise<UserRecord[]> {
  const res = await api.get("/api/users");
  return res.data?.data ?? [];
}

export async function createUser(input: UserInput): Promise<UserRecord> {
  const res = await api.post("/api/users", input);
  return res.data?.data;
}

export async function updateUser(id: string, patch: Partial<UserInput>): Promise<UserRecord> {
  const res = await api.put(`/api/users/${id}`, patch);
  return res.data?.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}
