import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import type { SLFPipelineApplication, SLFStageId } from "./slf.pipeline.types";

type SLFPipelineCardProps = {
  card: SLFPipelineApplication;
  stageId: SLFStageId;
  onClick: (id: string) => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const SLFPipelineCard = ({ card, onClick, stageId }: SLFPipelineCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { stageId, card }
  });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={clsx("pipeline-card", { "pipeline-card--dragging": isDragging })}
      onClick={() => onClick(card.id)}
      {...attributes}
      {...listeners}
    >
      <div className="pipeline-card__title">{card.applicantName}</div>
      <div className="pipeline-card__subtitle">{card.businessName}</div>
      <div className="pipeline-card__meta">
        <span>{formatCurrency(card.requestedAmount)}</span>
        <span>{card.productType}</span>
      </div>
      <div className="pipeline-card__meta">
        <span>{card.country}</span>
        <span>Received: {new Date(card.receivedDate).toLocaleDateString()}</span>
      </div>
      <div className="pipeline-card__footer">
        <span>Assigned: {card.assignedStaff ?? "Unassigned"}</span>
        <span className="pipeline-card__status">{card.status}</span>
      </div>
    </div>
  );
};

export default SLFPipelineCard;
