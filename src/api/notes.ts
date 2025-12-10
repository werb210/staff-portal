import { apiClient } from "./client";

export type NoteMessage = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export const fetchNotesThread = (applicationId: string) =>
  apiClient.get<NoteMessage[]>(`/communications/chat/thread/${applicationId}`);

export const sendNoteMessage = (applicationId: string, body: string) =>
  apiClient.post(`/communications/chat/send`, { applicationId, body, internalOnly: true });
