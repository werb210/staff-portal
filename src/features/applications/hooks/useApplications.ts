import { useQuery } from "@tanstack/react-query";
import {
  ApplicationsResponse,
  fetchApplications
} from "@/lib/api/applications";

export function useApplications(page: number, limit: number) {
  return useQuery({
    queryKey: ["applications", page, limit],
    queryFn: (): Promise<ApplicationsResponse> => fetchApplications(page, limit)
  });
}
