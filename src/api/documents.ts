import { apiClient } from './config';
import type { Document } from '../utils/types';

export async function getDocuments(): Promise<Document[]> {
  const { data } = await apiClient.get<Document[]>('/documents');
  return data;
}

export async function acceptDocument(documentId: string): Promise<Document> {
  const { data } = await apiClient.post<Document>(`/documents/${documentId}/accept`);
  return data;
}

export async function rejectDocument(documentId: string, reason?: string): Promise<Document> {
  const { data } = await apiClient.post<Document>(`/documents/${documentId}/reject`, { reason });
  return data;
}
