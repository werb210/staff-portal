import { useDroppable } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import PipelineCard from "./PipelineCard";
import { pipelineApi } from "./pipeline.api";
import { pipelineQueryKeys } from "./pipeline.store";
import type { PipelineApplication, PipelineFilters, PipelineStage, PipelineStageId } from "./pipeline.types";
import { canMoveCardToStage } from "./pipeline.types";

const LoadingSkeleton = () => (
  <div className="pipeline-card pipeline-card--skeleton">
    <div className="skeleton-line" />
    <div className="skeleton-line skeleton-line--short" />
    <div className="skeleton-pill-row">
      <span className="skeleton-pill" />
      <span className="skeleton-pill" />
    </div>
    <div className="skeleton-line" />
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="pipeline-column__empty">No applications in {label}.</div>
);

type PipelineColumnProps = {
  stage: PipelineStage;
  filters: PipelineFilters;
  onCardClick: (id: string) => void;
  activeCard?: PipelineApplication | null;
  draggingFromStage?: PipelineStageId | null;
};

const PipelineColumn = ({ stage, filters, onCardClick, activeCard, draggingFromStage }: PipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const { data, isLoading, isFetching } = useQuery({
    queryKey: pipelineQueryKeys.column(stage.id, filters),
    queryFn: () => pipelineApi.fetchColumn(stage.id, filters),
    staleTime: 30_000
  });

  const applications = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.data?.items)
        ? data.data.items
        : [];

  const canReceive = activeCard ? canMoveCardToStage(activeCard, draggingFromStage ?? null, stage.id) : true;

  return (
    <div className="pipeline-column" ref={setNodeRef} data-stage={stage.id}>
      <div className="pipeline-column__header">
        <div>
          <div className="pipeline-column__title">{stage.label}</div>
          {stage.description && <div className="pipeline-column__subtitle">{stage.description}</div>}
        </div>
        {stage.terminal && <span className="pipeline-column__pill">Terminal</span>}
      </div>
      <div
        className={clsx("pipeline-column__body", {
          "pipeline-column__body--over": isOver && canReceive,
          "pipeline-column__body--blocked": isOver && !canReceive
        })}
      >
        {(isLoading || isFetching) && (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        )}
        {!isLoading && !applications.length && <EmptyState label={stage.label} />}
        {applications.map((card) => (
          <PipelineCard key={card.id} card={card} stageId={stage.id} onClick={onCardClick} />
        ))}
        {activeCard && <div className="pipeline-column__spacer" />}
      </div>
    </div>
  );
};

export default PipelineColumn;
