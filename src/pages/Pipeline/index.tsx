import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Drawer } from "../../components/common/Drawer";
import { Spinner } from "../../components/common/Spinner";

import {
  usePipelineBoard,
  usePipelineMutations,
  type PipelineColumn,
} from "../../hooks/usePipeline";

import ApplicationDrawer from "./ApplicationDrawer";

const PipelinePage = () => {
  const boardQuery = usePipelineBoard();
  const { stageMutation } = usePipelineMutations();

  const [selectedApplication, setSelectedApplication] = useState<
    string | null
  >(null);

  // backend returns array: PipelineColumn[]
  const columns: PipelineColumn[] = useMemo(
    () => (Array.isArray(boardQuery.data) ? boardQuery.data : []),
    [boardQuery.data]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const applicationId = active.id as string;
    const fromStage = active.data.current?.stage as string | undefined;
    const toStage = over.id as string;

    if (!fromStage || !toStage || fromStage === toStage) return;

    stageMutation.mutate({
      applicationId,
      fromStage,
      toStage,
      position: 0,
    });
  };

  if (boardQuery.isLoading) return <Spinner />;

  return (
    <section className="page pipeline">
      <header className="page-header">
        <div>
          <h2>Pipeline</h2>
          <p>Drag and drop applications to update their stage.</p>
        </div>
      </header>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="pipeline-board">
          {columns.map((column) => (
            <PipelineColumnView
              key={column.name}
              column={column}
              onSelect={setSelectedApplication}
            />
          ))}
        </div>
      </DndContext>

      <Drawer
        title="Application Details"
        open={Boolean(selectedApplication)}
        onClose={() => setSelectedApplication(null)}
        width={720}
      >
        {selectedApplication && (
          <ApplicationDrawer applicationId={selectedApplication} />
        )}
      </Drawer>
    </section>
  );
};

const PipelineColumnView = ({
  column,
  onSelect,
}: {
  column: PipelineColumn;
  onSelect: (id: string) => void;
}) => {
  // droppable id MUST MATCH canonical stage names
  const { setNodeRef, isOver } = useDroppable({
    id: column.name,
  });

  return (
    <div
      className={`pipeline-column ${isOver ? "is-over" : ""}`}
      ref={setNodeRef}
    >
      <header>
        <h3>{column.name}</h3>
        <span>{column.cards.length}</span>
      </header>

      <div className="pipeline-cards">
        {column.cards.map((card) => (
          <PipelineCardView key={card.id} card={card} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

const PipelineCardView = ({
  card,
  onSelect,
}: {
  card: PipelineColumn["cards"][number];
  onSelect: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: { stage: card.stage },
    });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <article
      className="pipeline-card"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(card.id)}
    >
      <h4>{card.applicantName || "Unknown Applicant"}</h4>

      <p>
        {card.amount
          ? `$${Number(card.amount).toLocaleString()}`
          : "—"}
      </p>

      <span className="updated-at">
        {card.updatedAt
          ? new Date(card.updatedAt).toLocaleDateString()
         : ""}
      </span>
    </article>
  );
};

export default PipelinePage;
