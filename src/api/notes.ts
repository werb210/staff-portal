import { apiClient, type RequestOptions } from "./httpClient";

export type NoteMessage = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export const fetchNotesThread = (applicationId: string, options?: RequestOptions) =>
  apiClient.get<NoteMessage[]>(`/communications/chat/thread/${applicationId}`, options);

export const sendNoteMessage = (applicationId: string, body: string) =>
  apiClient.post(`/communications/chat/send`, { applicationId, body, internalOnly: true });
