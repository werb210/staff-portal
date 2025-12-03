import api from "./apiClient";

export async function getPipeline() {
  const res = await api.get("/pipeline");
  return res.data.data;
}

export async function movePipelineCard(appId: string, newStage: string) {
  await api.patch(`/pipeline/${appId}/move`, {
    stage: newStage,
  });
}
