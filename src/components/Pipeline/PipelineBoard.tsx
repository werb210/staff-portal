import { usePipeline, type PipelineStage } from '../../hooks/api/usePipeline';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PipelineColumn from './PipelineColumn';
import { useNotifications } from '../../hooks/useNotifications';

export default function PipelineBoard() {
  const { data: pipeline, isLoading } = usePipeline();
  const stages: PipelineStage[] = pipeline ?? [];
  const sensors = useSensors(useSensor(PointerSensor));
  const { sendNotification } = useNotifications();

  if (isLoading) return <p>Loading pipeline...</p>;

  const handleDragEnd = (event: DragEndEvent) => {
    // Implement API call to update stage order
    console.log('Dragged:', event);

    if (event.over && event.active.id !== event.over.id) {
      sendNotification('Pipeline Updated', 'Stage order has been updated.');
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stages.map((stage) => stage.id)} strategy={verticalListSortingStrategy}>
        {stages.map((stage) => (
          <PipelineColumn key={stage.id} stage={stage} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
