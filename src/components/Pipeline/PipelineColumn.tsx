import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { PipelineStage } from '../../types/pipeline';
import { PipelineCard } from './PipelineCard';

interface PipelineColumnProps {
  stage: PipelineStage;
}

export default function PipelineColumn({ stage }: PipelineColumnProps) {
  const { setNodeRef: setDroppableRef } = useDroppable({ id: stage.id, data: { stageId: stage.id } });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
    data: { type: 'stage' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const applications = stage.applications ?? [];

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      className={`pipeline-column ${isDragging ? 'pipeline-column--dragging' : ''}`}
      style={style}
      {...attributes}
      {...listeners}
    >
      <header>
        <h3>{stage.name}</h3>
        <span>{applications.length} apps</span>
      </header>
      <SortableContext items={applications.map((app) => app.id)} strategy={verticalListSortingStrategy}>
        <div className="pipeline-column__list">
          {applications.map((application) => (
            <PipelineCard key={application.id} application={application} stageId={stage.id} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
