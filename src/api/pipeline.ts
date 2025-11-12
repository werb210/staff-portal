import { apiClient } from './client';

export type PipelineStage = 'New' | 'In Review' | 'Underwriting' | 'Conditions' | 'Closing' | 'Funded';

export interface PipelineCard {
  id: string;
  applicant: string;
  amount: number;
  stage: PipelineStage;
  updatedAt: string;
}

export interface PipelineBoard {
  stage: PipelineStage;
  applications: PipelineCard[];
}

export interface PipelineMovePayload {
  applicationId: string;
  fromStage: PipelineStage;
  toStage: PipelineStage;
  position: number;
}

export const getPipelineBoard = async (): Promise<PipelineBoard[]> => {
  const { data } = await apiClient.get<PipelineBoard[]>('/pipeline');
  return data;
};

export const updatePipelineStage = async (payload: PipelineMovePayload): Promise<void> => {
  await apiClient.post('/pipeline/move', payload);
};

export const getPipelineApplication = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/${id}`);
  return data;
};

export const updatePipelineApplication = async (id: string, input: Record<string, unknown>) => {
  const { data } = await apiClient.put(`/pipeline/${id}`, input);
  return data;
};

export const getPipelineDocuments = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/${id}/documents`);
  return data;
};

export const getPipelineLenders = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/${id}/lenders`);
  return data;
};

export const getPipelineAISummary = async (id: string) => {
  const { data } = await apiClient.get(`/pipeline/${id}/ai-summary`);
  return data;
};
