import { apiClient } from './config';
import type { PipelineStage } from '../utils/types';

export async function getPipeline(): Promise<PipelineStage[]> {
  const { data } = await apiClient.get<PipelineStage[]>('/pipeline');
  return data;
}

export async function updateStage(applicationId: string, stageId: string): Promise<PipelineStage[]> {
  const { data } = await apiClient.post<PipelineStage[]>(`/pipeline/${applicationId}`, { stageId });
  return data;
}
