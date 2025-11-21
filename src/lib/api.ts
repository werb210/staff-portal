import axios, { AxiosError } from "axios";
import { PipelineCard, PipelineStage } from "@/features/pipeline/PipelineTypes";

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.warn("VITE_API_URL is not defined; API calls may fail.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("bf_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("bf_token");
      localStorage.removeItem("bf_role");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

function toErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      "Request failed"
    );
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
}

async function handleRequest<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
}

export async function getPipelineStages(): Promise<PipelineStage[]> {
  return handleRequest(api.get("/pipeline/stages"));
}

export async function getApplicationsByStage(stageId: string): Promise<PipelineCard[]> {
  return handleRequest(api.get(`/pipeline/applications`, { params: { stageId } }));
}

export async function moveApplication(appId: string, stageId: string): Promise<void> {
  await handleRequest(api.patch(`/pipeline/applications/${appId}/move`, { stageId }));
}

export async function getApplicationDetails(appId: string): Promise<PipelineCard> {
  return handleRequest(api.get(`/pipeline/applications/${appId}`));
}

export const get = (url: string, config?: any) => api.get(url, config);
export const post = (url: string, data?: any, config?: any) => api.post(url, data, config);
export const put = (url: string, data?: any, config?: any) => api.put(url, data, config);
export const del = (url: string, config?: any) => api.delete(url, config);

export default api;
