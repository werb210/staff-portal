import { apiFetch } from "../lib/apiClient";

export async function getDashboardMetrics() {
  return apiFetch("/api/dashboard/metrics");
}

export const loadDashboard = getDashboardMetrics;

export async function getPipeline() {
  return apiFetch("/api/dashboard/pipeline");
}

export const loadPipeline = getPipeline;

export async function getOffers() {
  return apiFetch("/api/dashboard/offers");
}

export const loadOffers = getOffers;
