import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import AppLoading from "@/components/layout/AppLoading";
import ErrorBanner from "@/components/ui/ErrorBanner";
import ApplicationCard from "@/pages/applications/ApplicationCard";
import type { DrawerTab } from "@/pages/applications/drawer/DrawerTabs";
import { PIPELINE_STAGE_LABELS, normalizeStageId } from "@/pages/applications/pipeline/pipeline.types";
import { fetchPortalApplication, openPortalApplication } from "@/api/applications";

type PortalApplicationShell = {
  id: string;
  businessName: string;
  stage: string;
};

const APPLICATION_TABS: DrawerTab[] = [
  { id: "application", label: "Application" },
  { id: "banking", label: "Banking Analysis" },
  { id: "financials", label: "Financials" },
  { id: "documents", label: "Documents" },
  { id: "credit-summary", label: "Credit Summary" },
  { id: "notes", label: "Notes" },
  { id: "lenders", label: "Lenders" }
];

const OPENED_APPLICATIONS_KEY = "portal.applications.opened";

const readOpenedApplications = () => {
  if (typeof window === "undefined") return new Set<string>();
  const stored = window.sessionStorage.getItem(OPENED_APPLICATIONS_KEY);
  if (!stored) return new Set<string>();
  try {
    return new Set<string>(JSON.parse(stored) as string[]);
  } catch {
    return new Set<string>();
  }
};

const writeOpenedApplications = (opened: Set<string>) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(OPENED_APPLICATIONS_KEY, JSON.stringify(Array.from(opened)));
};

const parsePortalApplication = (data: unknown, id: string): PortalApplicationShell => {
  if (!data || typeof data !== "object") {
    return { id, businessName: "Unknown business", stage: "Received" };
  }
  const record = data as Record<string, unknown>;
  const businessName =
    typeof record.businessName === "string"
      ? record.businessName
      : typeof record.business_name === "string"
        ? record.business_name
        : typeof record.applicant === "string"
          ? record.applicant
          : typeof record.business === "object" && record.business && "name" in record.business
            ? String((record.business as { name?: unknown }).name ?? "Unknown business")
            : "Unknown business";
  const stageValue =
    typeof record.current_stage === "string"
      ? record.current_stage
      : typeof record.stage === "string"
        ? record.stage
        : "Received";
  return { id, businessName, stage: stageValue };
};

const resolveStageLabel = (stage: string) => {
  const normalized = normalizeStageId(stage);
  return PIPELINE_STAGE_LABELS[normalized] ?? stage;
};

const ApplicationShellPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState(APPLICATION_TABS[0].id);

  const applicationQuery = useQuery({
    queryKey: ["portal-application", id],
    queryFn: ({ signal }) => fetchPortalApplication(id ?? "", { signal }),
    enabled: Boolean(id),
    retry: false
  });

  const openMutation = useMutation({
    mutationFn: (applicationId: string) => openPortalApplication(applicationId)
  });

  useEffect(() => {
    if (!id) return;
    const openedApplications = readOpenedApplications();
    if (openedApplications.has(id)) return;
    openedApplications.add(id);
    writeOpenedApplications(openedApplications);
    openMutation.mutate(id);
  }, [id, openMutation]);

  const application = useMemo(() => {
    if (!id) {
      return { id: "unknown", businessName: "Unknown business", stage: "Received" };
    }
    return parsePortalApplication(applicationQuery.data, id);
  }, [applicationQuery.data, id]);

  const stageLabel = resolveStageLabel(application.stage);

  return (
    <div className="application-shell">
      <Card title="Application">
        {applicationQuery.isLoading && <AppLoading />}
        {applicationQuery.error && <ErrorBanner message="Unable to load this application." />}
        <div className="application-shell__header">
          <div>
            <div className="application-shell__title">{application.businessName}</div>
            <span className="application-shell__badge">{stageLabel}</span>
          </div>
          <button className="ui-button ui-button--secondary" type="button">
            Call Client
          </button>
        </div>
        <ApplicationCard tabs={APPLICATION_TABS} selectedTab={selectedTab} onSelect={setSelectedTab}>
          <div className="application-shell__placeholder">Coming in next block.</div>
        </ApplicationCard>
      </Card>
    </div>
  );
};

export default ApplicationShellPage;
