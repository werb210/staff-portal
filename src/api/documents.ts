import { apiClient } from './client';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  uploadedBy: string;
  downloadUrl?: string;
}

export const getDocuments = async (): Promise<DocumentItem[]> => {
  const { data } = await apiClient.get<DocumentItem[]>('/documents');
  return data;
};

export const approveDocument = async (id: string) => {
  await apiClient.post(`/documents/${id}/approve`);
};

export const rejectDocument = async (id: string, reason: string) => {
  await apiClient.post(`/documents/${id}/reject`, { reason });
};

export const uploadDocumentVersion = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post(`/documents/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
