import { useQuery } from "@tanstack/react-query";
import {
  ApplicationDetail,
  fetchApplication,
  fetchApplicationFull
} from "@/lib/api/applications";

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: (): Promise<ApplicationDetail> => fetchApplication(id)
  });
}

export function useApplicationFull(id: string) {
  return useQuery({
    queryKey: ["application-full", id],
    queryFn: (): Promise<ApplicationDetail> => fetchApplicationFull(id)
  });
}
