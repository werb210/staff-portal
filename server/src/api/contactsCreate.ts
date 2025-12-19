import axios from "axios";
import { getAuthToken } from "../utils/authToken";
import { API_BASE_URL } from "../utils/env";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
}

export async function createContact(data: CreateContactInput) {
  const res = await api.post("/api/crm/contacts", data);
  return res.data.data;
}
