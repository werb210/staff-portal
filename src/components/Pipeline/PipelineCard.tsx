import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { PipelineCard as CardType } from "../../hooks/usePipeline";

interface Props {
  card: CardType;
  onSelect?: (id: string) => void; // optional — parent controls drawer
}

export default function PipelineCard({ card, onSelect }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { status: card.status }, // canonical stage name
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
      <h4>{card.applicant}</h4>

      {card.amount !== undefined && (
        <p>${card.amount.toLocaleString()}</p>
      )}

      <small>
        {card.updatedAt
          ? new Date(card.updatedAt).toLocaleDateString()
          : ""}
      </small>
    </article>
  );
}
