import { useQuery } from "@tanstack/react-query";
import { getApplication, getApplicationFull } from "@/lib/api/applications";

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplication(id)
  });
}

export function useApplicationFull(id: string) {
  return useQuery({
    queryKey: ["application-full", id],
    queryFn: () => getApplicationFull(id)
  });
}
