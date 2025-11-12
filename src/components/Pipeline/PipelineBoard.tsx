import { usePipeline, type PipelineStage } from '../../hooks/api/usePipeline';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PipelineColumn from './PipelineColumn';
import { useNotifications } from '../../hooks/useNotifications';
import { useTwilioNotifications } from '../../hooks/useTwilioNotifications';
import { useO365Notifications } from '../../hooks/useO365Notifications';

export default function PipelineBoard() {
  const { data: pipeline, isLoading } = usePipeline();
  const stages: PipelineStage[] = pipeline ?? [];
  const sensors = useSensors(useSensor(PointerSensor));
  const { sendNotification } = useNotifications();
  const { sendSMS } = useTwilioNotifications();
  const { sendEmail } = useO365Notifications();
  void sendSMS;
  void sendEmail;

  if (isLoading) return <p>Loading pipeline...</p>;

  const handleDragEnd = (event: DragEndEvent) => {
    // Implement API call to update stage order
    console.log('Dragged:', event);

    if (event.over && event.active.id !== event.over.id) {
      sendNotification('Pipeline Updated', 'Stage order has been updated.');
      // Example: trigger notifications on stage change
      // sendSMS('+15551234567', 'Pipeline stage updated');
      // sendEmail('staff@example.com', 'Pipeline Update', 'Stage changed for Application #123');
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
