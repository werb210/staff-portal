import axios from "axios";
import { getAuthToken } from "../utils/authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((cfg) => {
  const t = getAuthToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return [];
  const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
  return res.data.data;
}
