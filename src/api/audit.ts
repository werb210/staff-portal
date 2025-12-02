import axios from "axios";
import { getAuthToken } from "../utils/authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken?.();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type AuditRecord = {
  id: string;
  eventType: string;
  actorId: string | null;
  entityId: string | null;
  entityType: string | null;
  details: any;
  createdAt: string;
};

export type AuditFilter = {
  eventType?: string;
  actorId?: string;
  entityType?: string;
  from?: string;
  to?: string;
};

export async function fetchAuditLogs(filter: AuditFilter = {}): Promise<AuditRecord[]> {
  const params: Record<string, string> = {};
  if (filter.eventType) params.eventType = filter.eventType;
  if (filter.actorId) params.actorId = filter.actorId;
  if (filter.entityType) params.entityType = filter.entityType;
  if (filter.from) params.from = filter.from;
  if (filter.to) params.to = filter.to;

  const res = await api.get("/api/audit", { params });
  return res.data?.data ?? [];
}
