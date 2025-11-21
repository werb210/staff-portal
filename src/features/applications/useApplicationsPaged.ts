import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PagedApplicationsResponse } from "@/types/application";

export function useApplicationsPaged(
  page: number,
  pageSize: number,
  search: string,
  sortBy: string,
  sortDirection: string
) {
  return useQuery<PagedApplicationsResponse>({
    queryKey: ["applications-paged", page, pageSize, search, sortBy, sortDirection],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortBy,
        sortDirection,
      });

      const res = await api.get(`/api/applications/paged?${params.toString()}`);
      return res.data;
    },
  });
}
