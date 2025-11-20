import api from "../../lib/api";
import { Pipeline, PipelineStage } from "./PipelineTypes";

export async function getPipeline(): Promise<Pipeline> {
  const res = await api.get("/api/pipeline");
  return res.data as Pipeline;
}

export async function moveCard(
  cardId: string,
  toStage: PipelineStage
): Promise<void> {
  await api.post("/api/pipeline/move", {
    cardId,
    stage: toStage,
  });
}

export async function getCardDetails(id: string): Promise<any> {
  const res = await api.get(`/api/pipeline/${id}`);
  return res.data;
}
