import { useQuery } from "@tanstack/react-query";
import { fetchApplicationDetails } from "@/api/applications";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import type { ApplicationDetails } from "@/types/application.types";

export const useApplicationDetails = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const query = useQuery<ApplicationDetails>({
    queryKey: ["applications", applicationId, "details"],
    queryFn: ({ signal }) => fetchApplicationDetails(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  return { applicationId, ...query };
};
