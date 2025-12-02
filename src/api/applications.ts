import axios from "axios";
import { getAuthToken } from "../utils/authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const t = getAuthToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// APP DATA
export async function getApplication(id: string) {
  const res = await api.get(`/api/applications/${id}`);
  return res.data.data;
}

// BANKING ANALYSIS
export async function getBanking(id: string) {
  const res = await api.get(`/api/applications/${id}/banking`);
  return res.data.data;
}

// FINANCIAL OCR
export async function getFinancials(id: string) {
  const res = await api.get(`/api/applications/${id}/financials`);
  return res.data.data;
}

// DOCUMENT CONTROLS
export async function getDocuments(id: string) {
  const res = await api.get(`/api/applications/${id}/documents`);
  return res.data.data;
}

export async function acceptDocument(docId: string) {
  await api.post(`/api/documents/${docId}/accept`);
}

export async function rejectDocument(docId: string) {
  await api.post(`/api/documents/${docId}/reject`);
}

export async function replaceDocument(docId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  await api.post(`/api/documents/${docId}/replace`, form);
}

// LENDERS
export async function getLenders(id: string) {
  const res = await api.get(`/api/applications/${id}/lenders`);
  return res.data.data;
}

export async function sendToLender(id: string, lenderId: string) {
  await api.post(`/api/applications/${id}/send/${lenderId}`);
}
