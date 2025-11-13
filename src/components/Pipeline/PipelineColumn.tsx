import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { PipelineColumn } from "../../api/pipeline";
import PipelineCard from "./PipelineCard";

interface ColumnProps {
  column: PipelineColumn;
}

export default function PipelineColumn({ column }: ColumnProps) {
  /**
   * Droppable region for the entire column.
   * ID MUST MATCH backend canonical stage name.
   */
  const { setNodeRef, isOver } = useDroppable({
    id: column.name, // <-- canonical: "New", "Requires Docs", ...
    data: { stage: column.name },
  });

  return (
    <div
      ref={setNodeRef}
      className={`pipeline-column ${isOver ? "is-over" : ""}`}
    >
      <header className="pipeline-column__header">
        <h3>{column.name}</h3>
        <span>{column.cards.length}</span>
      </header>

      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="pipeline-column__list">
          {column.cards.map((card) => (
            <PipelineCard key={card.id} card={card} stage={column.name} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
