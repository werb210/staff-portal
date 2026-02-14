import { apiClient } from "@/api/httpClient";

export type WebsiteIssue = {
  id: string;
  message: string;
  screenshotUrl?: string;
};

export async function resolveIssue(id: string) {
  return apiClient.patch(`/support/issues/${id}/resolve`);
}

export async function deleteIssue(id: string) {
  await fetch(`/api/support/issues/${id}`, {
    method: "DELETE"
  });
}

export async function fetchWebsiteIssues() {
  const data = await apiClient.get<WebsiteIssue[] | { issues?: WebsiteIssue[] }>("/support/issues");
  return Array.isArray(data) ? data : (data.issues ?? []);
}
