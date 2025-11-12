import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import type { PipelineApplication } from '../../types/pipeline';

interface PipelineCardProps {
  application: PipelineApplication;
  stageId: string;
}

export function PipelineCard({ application, stageId }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
    data: { stageId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pipeline-card ${isDragging ? 'pipeline-card--dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <strong>{application.name}</strong>
      {application.amountRequested && <span>${application.amountRequested.toLocaleString()}</span>}
      <small>{application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : ''}</small>
    </div>
  );
}
