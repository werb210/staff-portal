import { Application, ApplicationListResponse } from "@/types/application";

const BASE = import.meta.env.VITE_API_URL;

export async function fetchApplications(): Promise<Application[]> {
  const res = await fetch(`${BASE}/api/applications`);
  if (!res.ok) throw new Error("Failed to fetch applications");
  const data: ApplicationListResponse = await res.json();
  return data.items;
}

export async function fetchApplication(id: string): Promise<Application> {
  const res = await fetch(`${BASE}/api/applications/${id}`);
  if (!res.ok) throw new Error("Failed to fetch application");
  return res.json();
}
