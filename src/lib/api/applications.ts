import api from "@/lib/api/http";

export async function getApplication(id: string) {
  const res = await api.get(`/api/applications/${id}`);
  return res.data;
}

export async function getApplicationFull(id: string) {
  const res = await api.get(`/api/applications/${id}/full`);
  return res.data;
}

export async function getDocuments(id: string) {
  const res = await api.get(`/api/applications/${id}/documents`);
  return res.data;
}

export async function getBanking(id: string) {
  const res = await api.get(`/api/applications/${id}/banking`);
  return res.data;
}

export async function getFinancials(id: string) {
  const res = await api.get(`/api/applications/${id}/financials`);
  return res.data;
}

export async function getOCR(id: string) {
  const res = await api.get(`/api/applications/${id}/ocr`);
  return res.data;
}

export async function getLenders(id: string) {
  const res = await api.get(`/api/applications/${id}/lenders`);
  return res.data;
}
