// src/api/pipeline.ts
import api from "../lib/api";

export async function fetchPipeline() {
  const res = await api.get("/pipeline");
  return res.data;
}

export async function updateStage(applicationId: string, stage: string) {
  const res = await api.post(`/pipeline/${applicationId}/stage`, { stage });
  return res.data;
}
