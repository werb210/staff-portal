import apiClient from "@/api/client";

export interface TagPayload {
  name?: string;
  color?: string;
  description?: string;
}

export const listTags = <T = unknown>() => apiClient.get<T>("/tags");

export const createTag = <T = unknown>(payload: TagPayload) => apiClient.post<T>("/tags", payload);

export const updateTag = <T = unknown>(tagId: string, payload: Partial<TagPayload>) =>
  apiClient.patch<T>(`/tags/${tagId}`, payload);

export const deleteTag = <T = unknown>(tagId: string) => apiClient.delete<T>(`/tags/${tagId}`);

export const assignTag = <T = unknown>(tagId: string, payload: { targetId: string; targetType: string }) =>
  apiClient.post<T>(`/tags/${tagId}/assign`, payload);
