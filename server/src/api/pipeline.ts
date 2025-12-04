import { api } from "@/lib/http";

export interface PipelineCard {
  id: string;
  companyName: string;
  status: string;
  stage: string;
}

export async function getPipeline() {
  const res = await api.get<PipelineCard[]>("/pipeline");
  return res.data;
}

export async function moveCard(id: string, newStage: string) {
  const res = await api.post(`/pipeline/${id}/move`, { newStage });
  return res.data;
}
