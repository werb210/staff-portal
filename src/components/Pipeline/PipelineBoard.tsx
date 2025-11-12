import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import PipelineColumn from './PipelineColumn';
import { usePipeline, usePipelineReorder, usePipelineTransition } from '../../hooks/api/usePipeline';
import { notificationService } from '../../services/notificationService';
import { useRBAC } from '../../hooks/useRBAC';
import { useMobilePipelineInteractions } from '../../hooks/mobile/useMobilePipeline';

export default function PipelineBoard() {
  const { data: pipeline, isLoading } = usePipeline();
  const transitionMutation = usePipelineTransition();
  const reorderMutation = usePipelineReorder();
  const { user } = useRBAC();
  const { isTouchDevice, announcement, announceDrag } = useMobilePipelineInteractions();
  const stages = pipeline ?? [];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  if (isLoading) return <div className="card loading-state">Loading pipeline...</div>;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeStageId = active.data.current?.stageId as string | undefined;
    const overStageId = over.data.current?.stageId as string | undefined;

    if (activeStageId && overStageId) {
      if (activeStageId === overStageId) {
        return;
      }
      const application = stages
        .flatMap((stage) => (stage.applications ?? []).map((app) => ({ ...app, stageId: stage.id })))
        .find((item) => item.id === active.id);

      transitionMutation.mutate(
        { applicationId: String(active.id), fromStageId: activeStageId, toStageId: overStageId },
        {
          onSuccess: async () => {
            if (application) {
              await notificationService.notifyStageChange({
                applicationId: application.id,
                stage: stages.find((stage) => stage.id === overStageId)?.name ?? overStageId,
                borrowerEmail: application.borrowerEmail,
                borrowerPhone: application.borrowerPhone,
              });
              announceDrag(stages.find((stage) => stage.id === overStageId)?.name ?? overStageId);
            }
          },
        }
      );
      return;
    }

    if (active.data.current?.type === 'stage' && over.id !== active.id) {
      const stageOrder = stages.map((stage) => stage.id);
      const oldIndex = stageOrder.indexOf(String(active.id));
      const newIndex = stageOrder.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderMutation.mutate({ stageOrder: arrayMove(stageOrder, oldIndex, newIndex) });
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stages.map((stage) => stage.id)} strategy={horizontalListSortingStrategy}>
        <div className="pipeline-board" aria-live={isTouchDevice ? 'polite' : 'off'}>
          {stages.map((stage) => (
            <PipelineColumn key={stage.id} stage={stage} />
          ))}
        </div>
      </SortableContext>
      {announcement && <p className="sr-only">{announcement}</p>}
      {stages.length === 0 && <p>No stages configured for {user?.silo} silo.</p>}
    </DndContext>
  );
}
