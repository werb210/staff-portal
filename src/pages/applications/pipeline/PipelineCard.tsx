import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import type { PipelineApplication, PipelineStageId } from "./pipeline.types";
import { PIPELINE_STAGE_LABELS, isTerminalStage } from "./pipeline.types";
import { usePipelineStore } from "./pipeline.store";
import { useAuth } from "@/hooks/useAuth";
import { canAccessStaffPortal } from "@/utils/roles";

type PipelineCardProps = {
  card: PipelineApplication;
  stageId: PipelineStageId;
  onClick: (id: string, stageId: PipelineStageId) => void;
};

const formatAmount = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const resolveMatchScore = (card: PipelineApplication) => {
  const raw = card.matchPercentage ?? card.matchPercent ?? card.matchScore ?? null;
  if (raw == null || raw === "") return null;
  if (typeof raw === "number" && Number.isNaN(raw)) return null;
  return raw;
};

const PipelineCard = ({ card, stageId, onClick }: PipelineCardProps) => {
  const { user } = useAuth();
  const setDragging = usePipelineStore((state) => state.setDragging);

  const canDrag = canAccessStaffPortal(user?.role) && !isTerminalStage(stageId);
  const draggable = useDraggable({
    id: card.id,
    disabled: !canDrag,
    data: { stageId, card }
  });

  const { attributes, listeners, setNodeRef, transform, isDragging } = draggable;

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  const handleClick = () => onClick(card.id, stageId);

  const staffLabel = card.assignedStaff ? `Assigned to ${card.assignedStaff}` : "Unassigned";
  const matchScore = resolveMatchScore(card);
  const matchLabel = matchScore != null ? `Match ${matchScore}%` : "Match pending";

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      onMouseDown={() => setDragging(card.id, stageId)}
      onMouseUp={() => setDragging(null, null)}
      onClick={handleClick}
      className={clsx("pipeline-card", {
        "pipeline-card--dragging": isDragging,
        "pipeline-card--disabled": !canDrag
      })}
      aria-label={`${card.businessName} in ${PIPELINE_STAGE_LABELS[stageId]}`}
    >
      <div className="pipeline-card__header">
        <div>
          <div className="pipeline-card__title">{card.businessName}</div>
          <div className="pipeline-card__subtitle">{card.contactName}</div>
        </div>
        <div className="pipeline-card__amount">{formatAmount(card.requestedAmount)}</div>
      </div>
      <div className="pipeline-card__meta">
        <span className="pipeline-card__pill">{card.productCategory}</span>
        <span className="pipeline-card__pill pipeline-card__pill--muted">{card.status}</span>
        <span className="pipeline-card__pill pipeline-card__pill--muted">{matchLabel}</span>
      </div>
      <div className="pipeline-card__progress">
        Documents: {card.documents.submitted}/{card.documents.required}
      </div>
      <div className="pipeline-card__indicators">
        <span className={clsx("pipeline-card__indicator", { "pipeline-card__indicator--active": card.bankingComplete })}>
          Banking
        </span>
        <span className={clsx("pipeline-card__indicator", { "pipeline-card__indicator--active": card.ocrComplete })}>
          OCR
        </span>
        <span className="pipeline-card__indicator pipeline-card__indicator--muted">{staffLabel}</span>
      </div>
      <div className="pipeline-card__footer">Created {new Date(card.createdAt).toLocaleDateString()}</div>
    </div>
  );
};

export default PipelineCard;
