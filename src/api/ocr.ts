// src/api/ocr.ts
import api from "../lib/api";

export async function runOCR(documentId: string) {
  const res = await api.post("/ocr/run", { documentId });
  return res.data;
}

export async function getOCRResults(applicationId: string) {
  const res = await api.get(`/ocr/${applicationId}`);
  return res.data;
}
