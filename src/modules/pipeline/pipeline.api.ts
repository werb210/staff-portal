import apiClient from "@/api/client";

export interface PipelineApplication {
  id: string;
  applicant?: string;
  company?: string;
  role?: string;
  location?: string;
  stageId: string;
  value?: number;
  updatedAt?: string;
  status?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  applications: PipelineApplication[];
}

export interface PipelineResponse {
  stages: PipelineStage[];
}

export interface MoveApplicationPayload {
  stageId: string;
  position?: number;
}

export const fetchPipeline = () => apiClient.get<PipelineResponse>("/api/applications/pipeline");

export const moveApplication = (applicationId: string, payload: MoveApplicationPayload) =>
  apiClient.post(`/api/applications/${applicationId}/move`, payload);
