import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import ErrorBanner from "@/components/ui/ErrorBanner";
import AppLoading from "@/components/layout/AppLoading";
import PipelineColumn from "./PipelineColumn";
import PipelineFilters from "./PipelineFilters";
import {
  buildStageLabelMap,
  sortPipelineStages,
  type PipelineStage
} from "./pipeline.types";
import { normalizeStageId } from "./pipeline.types";
import { usePipelineStore } from "./pipeline.store";
import { useSilo } from "@/hooks/useSilo";
import { pipelineApi } from "./pipeline.api";

const NoPipelineAvailable = ({ silo }: { silo: string }) => (
  <div className="pipeline-empty">Pipeline is not available for the {silo} silo.</div>
);

const PipelinePage = () => {
  const { silo } = useSilo();
  const navigate = useNavigate();
  const filters = usePipelineStore((state) => state.currentFilters);
  const resetPipeline = usePipelineStore((state) => state.resetPipeline);

  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["pipeline"],
    queryFn: ({ signal }) => pipelineApi.fetchPipeline({ signal }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchInterval: 15_000
  });

  const orderedStages = useMemo(() => sortPipelineStages(data?.stages ?? []), [data?.stages]);
  const stageLabelMap = useMemo(() => buildStageLabelMap(orderedStages), [orderedStages]);
  const applications = data?.applications ?? [];

  const filteredApplications = useMemo(() => {
    let filtered = [...applications];
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (application) =>
          application.businessName?.toLowerCase().includes(term) ||
          application.contactName?.toLowerCase().includes(term)
      );
    }
    if (filters.productCategory) {
      filtered = filtered.filter((application) => application.productCategory === filters.productCategory);
    }
    if (filters.submissionMethod) {
      filtered = filtered.filter((application) => application.submissionMethod === filters.submissionMethod);
    }
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
      const to = filters.dateTo ? new Date(filters.dateTo).getTime() : null;
      filtered = filtered.filter((application) => {
        const dateValue = application.updatedAt ?? application.createdAt;
        const parsed = dateValue ? new Date(dateValue).getTime() : Number.NaN;
        if (Number.isNaN(parsed)) return false;
        if (from !== null && parsed < from) return false;
        if (to !== null && parsed > to) return false;
        return true;
      });
    }
    return filtered;
  }, [applications, filters]);

  useEffect(() => () => resetPipeline(), [resetPipeline]);

  if (silo !== "BF") {
    return <NoPipelineAvailable silo={silo} />;
  }

  const handleCardClick = (id: string) => {
    navigate(`/applications/${id}`);
  };

  const sortStageApplications = (stageId: string) => {
    const stageApplications = filteredApplications.filter(
      (application) => normalizeStageId(application.stage) === normalizeStageId(stageId)
    );
    const tieBreaker = (a: (typeof stageApplications)[number], b: (typeof stageApplications)[number]) =>
      a.id.localeCompare(b.id);
    switch (filters.sort) {
      case "oldest":
        return stageApplications.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || tieBreaker(a, b)
        );
      case "highest_amount":
        return stageApplications.sort((a, b) => {
          const aAmount = a.requestedAmount ?? 0;
          const bAmount = b.requestedAmount ?? 0;
          return bAmount - aAmount || tieBreaker(a, b);
        });
      case "lowest_amount":
        return stageApplications.sort((a, b) => {
          const aAmount = a.requestedAmount ?? 0;
          const bAmount = b.requestedAmount ?? 0;
          return aAmount - bAmount || tieBreaker(a, b);
        });
      case "newest":
      default:
        return stageApplications.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || tieBreaker(a, b)
        );
    }
  };

  return (
    <div className="pipeline-page">
      <Card title="Application Pipeline">
        <PipelineFilters />
        {isLoading && <AppLoading />}
        {error && <ErrorBanner message="Unable to load the pipeline right now." />}
        <div className="pipeline-columns">
          {orderedStages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              stageLabel={stageLabelMap[stage.id] ?? stage.label}
              cards={sortStageApplications(stage.id)}
              isLoading={isLoading}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PipelinePage;
