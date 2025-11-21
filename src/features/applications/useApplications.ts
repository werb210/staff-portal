import { useQuery } from "@tanstack/react-query";
import { fetchApplications, fetchApplication } from "@/lib/api/applications";

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: () => fetchApplication(id),
    enabled: Boolean(id),
  });
}
