import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";

import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";

import PipelineColumn from "./PipelineColumn";
import { usePipelineBoard, usePipelineMutations } from "../../hooks/usePipeline";
import { Spinner } from "../common/Spinner";
import { notificationService } from "../../services/notificationService";

/**
 * Canonical Staff Pipeline Stages
 * MUST match backend exactly.
 */
const CANONICAL_STAGES = [
  "New",
  "Requires Docs",
  "In Review",
  "Sent to Lenders",
  "Approved",
  "Declined",
] as const;

export default function PipelineBoard() {
  const boardQuery = usePipelineBoard();
  const { stageMutation } = usePipelineMutations();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  if (boardQuery.isLoading) return <Spinner />;
  if (!boardQuery.data) return <p>Error loading pipeline.</p>;

  const columns = boardQuery.data;

  /**
   * Drag End → Move Card Between Columns
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over) return;

    const applicationId = String(active.id);
    const fromStage = active.data.current?.status;
    const toStage = String(over.id);

    if (!fromStage || !toStage || fromStage === toStage) return;

    // Frontend optimistic UI handled in hook
    stageMutation.mutate(
      {
        applicationId,
        fromStage,
        toStage,
        position: 0,
      },
      {
        onSuccess: () => {
          const targetColumn = columns.find((c) => c.status === toStage);
          notificationService.notifyStageChange({
            applicationId,
            stage: targetColumn?.title ?? toStage,
          });
        },
      }
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={CANONICAL_STAGES}
        strategy={horizontalListSortingStrategy}
      >
        <div className="pipeline-board">
          {columns.map((column) => (
            <PipelineColumn key={column.status} column={column} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
