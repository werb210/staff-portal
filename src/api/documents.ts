// src/api/documents.ts
import api from "../lib/api";

export async function uploadDocument(formData: FormData) {
  const res = await api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getDocuments(applicationId: string) {
  const res = await api.get(`/documents/${applicationId}`);
  return res.data;
}

export async function deleteDocument(id: string) {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
}
