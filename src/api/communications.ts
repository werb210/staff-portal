import { apiClient } from "./client";

export type CommunicationThread = {
  id: string;
  subject: string;
  updatedAt: string;
};

export const fetchCommunicationThreads = () =>
  apiClient.get<CommunicationThread[]>("/communications/threads");
