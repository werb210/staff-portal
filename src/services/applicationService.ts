import apiClient from '../hooks/api/axiosClient';
import type {
  ApplicationCompletionPayload,
  ApplicationPayload,
  ApplicationSummary,
  DocumentUploadPayload,
} from '../types/applications';

export const applicationService = {
  list: async () => (await apiClient.get<ApplicationSummary[]>('/api/applications')).data,
  create: async (payload: ApplicationPayload) =>
    (await apiClient.post<ApplicationSummary>('/api/applications/create', payload)).data,
  submit: async (applicationId: string) =>
    (await apiClient.post('/api/applications/submit', { applicationId })).data,
  uploadDocument: async (payload: DocumentUploadPayload) =>
    (await apiClient.post('/api/applications/upload', payload)).data,
  complete: async (payload: ApplicationCompletionPayload) =>
    (await apiClient.post('/api/applications/complete', payload)).data,
};
