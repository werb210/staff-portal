import axios from "axios";
import { getAuthToken } from "../utils/authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const t = getAuthToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export interface PipelineApp {
  id: string;
  businessName: string;
  stage: string;
  createdAt: string;
}

export async function fetchPipeline(): Promise<PipelineApp[]> {
  const res = await api.get("/api/pipeline");
  return res.data.data;
}

export async function updateStage(id: string, stage: string): Promise<void> {
  await api.put(`/api/pipeline/${id}/stage`, { stage });
}
