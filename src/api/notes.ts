import { apiClient, type RequestOptions } from "./httpClient";

export type NoteMessage = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
};

export const fetchNotesThread = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<NoteMessage[]>(`/api/portal/applications/${applicationId}/notes`, options);

export const sendNoteMessage = (applicationId: string, body: string) =>
  apiClient.post(`/api/portal/applications/${applicationId}/notes`, { body });

export const updateNoteMessage = (applicationId: string, noteId: string, body: string) =>
  apiClient.patch(`/api/portal/applications/${applicationId}/notes/${noteId}`, { body });
