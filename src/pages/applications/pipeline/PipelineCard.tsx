import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import type { PipelineApplication, PipelineStageId } from "./pipeline.types";
import { usePipelineStore } from "./pipeline.store";
import { useAuth } from "@/hooks/useAuth";
import { canAccessStaffPortal } from "@/utils/roles";

type PipelineCardProps = {
  card: PipelineApplication;
  stageId: PipelineStageId;
  stageLabel: string;
  isTerminalStage: boolean;
  onClick: (id: string, stageId: PipelineStageId) => void;
};

const formatAmount = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
};

const resolveMatchScore = (card: PipelineApplication) => {
  const raw = card.matchPercentage ?? card.matchPercent ?? card.matchScore ?? null;
  if (raw == null || raw === "") return null;
  if (typeof raw === "number" && Number.isNaN(raw)) return null;
  return raw;
};

const PipelineCard = ({ card, stageId, stageLabel, isTerminalStage, onClick }: PipelineCardProps) => {
  const { user } = useAuth();
  const setDragging = usePipelineStore((state) => state.setDragging);

  const canDrag = canAccessStaffPortal(user?.role) && !isTerminalStage;
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
  const documentsSubmitted =
    typeof card.documents?.submitted === "number" ? card.documents.submitted : null;
  const documentsRequired =
    typeof card.documents?.required === "number" ? card.documents.required : null;
  const documentsLabel =
    documentsSubmitted !== null && documentsRequired !== null
      ? `Documents: ${documentsSubmitted}/${documentsRequired}`
      : "Documents: —";
  const matchScore = resolveMatchScore(card);
  const matchLabel = matchScore != null ? `Match ${matchScore}%` : "Match pending";
  const createdAtLabel = (() => {
    if (!card.createdAt) return "—";
    const parsed = new Date(card.createdAt);
    return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
  })();

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
      aria-label={`${card.businessName ?? "Application"} in ${stageLabel}`}
    >
      <div className="pipeline-card__header">
        <div>
          <div className="pipeline-card__title">{card.businessName ?? "Unknown business"}</div>
          <div className="pipeline-card__subtitle">{card.contactName ?? "Unknown contact"}</div>
        </div>
        <div className="pipeline-card__amount">{formatAmount(card.requestedAmount)}</div>
      </div>
      <div className="pipeline-card__meta">
        <span className="pipeline-card__pill">{card.productCategory ?? "Unspecified"}</span>
        <span className="pipeline-card__pill pipeline-card__pill--muted">{card.status ?? "Pending"}</span>
        <span className="pipeline-card__pill pipeline-card__pill--muted">{matchLabel}</span>
      </div>
      <div className="pipeline-card__progress">{documentsLabel}</div>
      {(typeof card.bankingComplete === "boolean" ||
        typeof card.ocrComplete === "boolean" ||
        Boolean(card.assignedStaff)) && (
        <div className="pipeline-card__indicators">
          {typeof card.bankingComplete === "boolean" && (
            <span
              className={clsx("pipeline-card__indicator", {
                "pipeline-card__indicator--active": card.bankingComplete
              })}
            >
              Banking
            </span>
          )}
          {typeof card.ocrComplete === "boolean" && (
            <span
              className={clsx("pipeline-card__indicator", {
                "pipeline-card__indicator--active": card.ocrComplete
              })}
            >
              OCR
            </span>
          )}
          {card.assignedStaff && (
            <span className="pipeline-card__indicator pipeline-card__indicator--muted">{staffLabel}</span>
          )}
        </div>
      )}
      <div className="pipeline-card__footer">Created {createdAtLabel}</div>
    </div>
  );
};

export default PipelineCard;
