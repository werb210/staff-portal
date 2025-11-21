import api from "../../lib/api";
import { Pipeline, PipelineStage } from "./PipelineTypes";

export async function getPipeline(): Promise<Pipeline> {
  const res = await api.get("/api/pipeline");
  return res.data as Pipeline;
}

export async function moveCard(
  appId: string,
  fromStage: PipelineStage,
  toStage: PipelineStage,
  positionIndex: number
): Promise<void> {
  await api.patch("/api/pipeline/move", {
    applicationId: appId,
    fromStage,
    toStage,
    positionIndex,
    movedAt: new Date().toISOString(),
  });
}

export async function getCardDetails(id: string): Promise<any> {
  const res = await api.get(`/api/pipeline/${id}`);
  return res.data;
}
