import { usePipeline, type PipelineStage } from '../../hooks/api/usePipeline';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PipelineColumn from './PipelineColumn';
import { useNotifications } from '../../hooks/useNotifications';
import { useTwilioNotifications } from '../../hooks/useTwilioNotifications';
import { useO365Notifications } from '../../hooks/useO365Notifications';
import { useNotificationService } from '../../services/notificationService';

export default function PipelineBoard() {
  const { data: pipeline, isLoading } = usePipeline();
  const stages: PipelineStage[] = pipeline ?? [];
  const sensors = useSensors(useSensor(PointerSensor));
  const { sendNotification } = useNotifications();
  const { sendSMS } = useTwilioNotifications();
  const { sendEmail } = useO365Notifications();
  const { notifyStageChange } = useNotificationService();
  void sendSMS;
  void sendEmail;
  void notifyStageChange;

  if (isLoading) return <p>Loading pipeline...</p>;

  const handleDragEnd = (event: DragEndEvent) => {
    // Implement API call to update stage order
    console.log('Dragged:', event);

    if (event.over && event.active.id !== event.over.id) {
      sendNotification('Pipeline Updated', 'Stage order has been updated.');
      // Example: trigger notifications on stage change
      // void notifyStageChange({
      //   applicationId: 'APP-12345',
      //   stage: 'In Review',
      //   applicantPhone: '+15551234567',
      //   applicantEmail: 'applicant@example.com'
      // });
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
