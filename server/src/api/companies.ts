import axios from "axios";
import { getAuthToken } from "../utils/authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Company {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  createdAt: string;
}

export async function fetchCompanies(): Promise<Company[]> {
  const res = await api.get("/api/crm/companies");
  return res.data.data;
}

export async function createCompany(data: Partial<Company>): Promise<Company> {
  const res = await api.post("/api/crm/companies", data);
  return res.data.data;
}
