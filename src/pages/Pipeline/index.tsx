import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import { Drawer } from '../../components/common/Drawer';
import { Spinner } from '../../components/common/Spinner';
import { usePipelineBoard, usePipelineMutations, type PipelineBoard } from '../../hooks/usePipeline';
import ApplicationDrawer from './ApplicationDrawer';

const PipelinePage = () => {
  const boardQuery = usePipelineBoard();
  const { stageMutation } = usePipelineMutations();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  const columns = useMemo(() => boardQuery.data ?? [], [boardQuery.data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
    const fromStage = active.data.current?.stage;
    const toStage = over.id as string;
    if (!fromStage || fromStage === toStage) return;

    stageMutation.mutate({
      applicationId: active.id as string,
      fromStage,
      toStage: toStage as any,
      position: 0,
    });
  };

  if (boardQuery.isLoading) {
    return <Spinner />;
  }

  return (
    <section className="page pipeline">
      <header className="page-header">
        <div>
          <h2>Pipeline</h2>
          <p>Drag and drop applications to update their status.</p>
        </div>
      </header>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="pipeline-board">
          {columns.map((column) => (
            <PipelineColumn
              key={column.stage}
              column={column}
              onSelect={(id) => setSelectedApplication(id)}
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
        {selectedApplication && <ApplicationDrawer applicationId={selectedApplication} />}
      </Drawer>
    </section>
  );
};

const PipelineColumn = ({ column, onSelect }: { column: PipelineBoard; onSelect: (id: string) => void }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.stage });

  return (
    <div className={`pipeline-column ${isOver ? 'is-over' : ''}`} ref={setNodeRef}>
      <header>
        <h3>{column.stage}</h3>
        <span>{column.applications.length}</span>
      </header>
      <div className="pipeline-cards">
        {column.applications.map((card) => (
          <PipelineCard key={card.id} card={card} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

const PipelineCard = ({
  card,
  onSelect,
}: {
  card: PipelineBoard['applications'][number];
  onSelect: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
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
      <h4>{card.applicant}</h4>
      <p>${card.amount.toLocaleString()}</p>
      <span>{card.updatedAt}</span>
    </article>
  );
};

export default PipelinePage;
