import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApplicationDetails } from "@/api/applications";
import type { ApplicationDetails } from "@/types/application.types";

const DrawerHeader = ({
  applicationId,
  onBack,
  canGoBack,
  onClose
}: {
  applicationId: string;
  onBack?: () => void;
  canGoBack?: boolean;
  onClose: () => void;
}) => {
  const { data } = useQuery<ApplicationDetails>({
    queryKey: ["applications", applicationId, "details"],
    queryFn: ({ signal }) => fetchApplicationDetails(applicationId, { signal }),
    enabled: Boolean(applicationId)
  });

  const title = useMemo(() => data?.applicant ?? "Application", [data]);
  const status = data?.status ?? "";

  return (
    <div className="application-drawer__header">
      <div>
        {onBack ? (
          <button
            className="ui-button ui-button--ghost"
            onClick={onBack}
            disabled={!canGoBack}
            type="button"
          >
            Back
          </button>
        ) : null}
        <div className="application-drawer__title">{title}</div>
        {status ? <div className="application-drawer__subtitle">Status: {status}</div> : null}
      </div>
      <button className="application-drawer__close" onClick={onClose} aria-label="Close drawer" type="button">
        ×
      </button>
    </div>
  );
};

export default DrawerHeader;
