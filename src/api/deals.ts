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

export interface Deal {
  id: string;
  title: string;
  companyId: string | null;
  contactId: string | null;
  stage: string;
  amount: number | null;
  createdAt: string;
}

export async function fetchDeals(): Promise<Deal[]> {
  const res = await api.get("/api/crm/deals");
  return res.data.data;
}

export async function createDeal(data: Partial<Deal>): Promise<Deal> {
  const res = await api.post("/api/crm/deals", data);
  return res.data.data;
}
