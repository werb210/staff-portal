import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { PipelineColumn as PipelineColumnType } from "../../hooks/usePipeline";
import PipelineCard from "./PipelineCard";

interface ColumnProps {
  column: PipelineColumnType;
}

export default function PipelineColumn({ column }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,        // Backend canonical identifier
    data: { status: column.status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`pipeline-column ${isOver ? "is-over" : ""}`}
    >
      <header className="pipeline-column__header">
        <h3>{column.title}</h3>
        <span>{column.cards.length}</span>
      </header>

      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="pipeline-column__list">
          {column.cards.map((card) => (
            <PipelineCard key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
