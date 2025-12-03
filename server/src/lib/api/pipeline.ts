import api from "@/lib/api/http";

export type PipelineApplication = {
  id: string;
  businessName: string;
  stageId?: string;
};

export type PipelineStage = {
  id: string;
  name: string;
  applications: PipelineApplication[];
};

export type PipelineResponse = {
  stages: PipelineStage[];
};

export async function fetchPipeline(): Promise<PipelineResponse> {
  const res = await api.get("/api/pipeline");
  return res.data;
}

export async function moveApplication(appId: string, toStageId: string) {
  const res = await api.post("/api/pipeline/move", {
    applicationId: appId,
    toStageId
  });

  return res.data;
}
