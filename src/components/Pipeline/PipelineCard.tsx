import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { PipelineCard as CardType } from "../../api/pipeline";

interface Props {
  card: CardType;
  onSelect?: (id: string) => void;
}

export default function PipelineCard({ card, onSelect }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { stage: card.stage }, // canonical pipeline stage name
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  } as React.CSSProperties;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`pipeline-card ${isDragging ? "pipeline-card--dragging" : ""}`}
      {...attributes}
      {...listeners}
      onClick={() => onSelect?.(card.id)}
    >
      {/* Applicant Name */}
      <h4>{card.applicantName ?? "Unnamed Applicant"}</h4>

      {/* Amount */}
      {typeof card.amount === "number" ? (
        <p>${card.amount.toLocaleString()}</p>
      ) : (
        <p>—</p>
      )}

      {/* Last Updated */}
      <small>
        {card.updatedAt
          ? new Date(card.updatedAt).toLocaleDateString()
          : ""}
      </small>
    </article>
  );
}
