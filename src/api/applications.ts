// src/api/applications.ts
import api from "../lib/api";

export async function fetchApplications() {
  const res = await api.get("/applications");
  return res.data;
}

export async function fetchApplicationById(id: string) {
  const res = await api.get(`/applications/${id}`);
  return res.data;
}

export async function createApplication(payload: any) {
  const res = await api.post("/applications", payload);
  return res.data;
}

export async function updateApplication(id: string, payload: any) {
  const res = await api.put(`/applications/${id}`, payload);
  return res.data;
}
