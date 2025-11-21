import apiClient from "../api";

export interface OcrRequestPayload {
  documentId?: string;
  language?: string;
  includeTables?: boolean;
}

export const submitOcrJob = <T = unknown>(documentId: string, payload?: OcrRequestPayload) =>
  apiClient.post<T>(`/ocr/${documentId}`, payload);

export const getOcrResult = <T = unknown>(documentId: string) =>
  apiClient.get<T>(`/ocr/${documentId}`);

export const retryOcr = <T = unknown>(documentId: string) =>
  apiClient.post<T>(`/ocr/${documentId}/retry`);
