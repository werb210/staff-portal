import { apiClient } from './config';
import type { Application, ApplicationPayload } from '../utils/types';

export async function getApplications(): Promise<Application[]> {
  const { data } = await apiClient.get<Application[]>('/applications');
  return data;
}

export async function submitApplication(payload: ApplicationPayload): Promise<Application> {
  const { data } = await apiClient.post<Application>('/applications', payload);
  return data;
}

export async function uploadDocument(applicationId: string, formData: FormData): Promise<Application> {
  const { data } = await apiClient.post<Application>(`/applications/${applicationId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}
