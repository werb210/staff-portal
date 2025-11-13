import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import PipelineColumn from "./PipelineColumn";
import { usePipelineBoard, usePipelineMutations } from "../../hooks/usePipeline";
import { Spinner } from "../common/Spinner";
import { notificationService } from "../../services/notificationService";

/**
 * Canonical Staff Pipeline Stages – must match backend
 */
const CANONICAL_STAGES: string[] = [
  "New",
  "Requires Docs",
  "In Review",
  "Sent to Lenders",
  "Approved",
  "Declined",
];

export default function PipelineBoard() {
  const boardQuery = usePipelineBoard();
  const { stageMutation } = usePipelineMutations();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  if (boardQuery.isLoading) return <Spinner />;
  if (!Array.isArray(boardQuery.data)) return <p>Error loading pipeline.</p>;

  const columns = boardQuery.data;

  /**
   * ───────────────────────────────────────────────────────
   *   HANDLE DRAG END → triggers /api/pipeline/cards/:id/move
   * ───────────────────────────────────────────────────────
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const applicationId = String(active.id);
    const fromStage = active.data.current?.stage; // MUST match draggable payload
    const toStage = String(over.id);              // MUST match droppable IDs

    if (!fromStage || !toStage || fromStage === toStage) return;

    stageMutation.mutate(
      {
        applicationId,
        fromStage,
        toStage,
        position: 0,
      },
      {
        onSuccess: () => {
          const targetColumn = columns.find((c) => c.name === toStage);

          notificationService.notifyStageChange({
            applicationId,
            stage: targetColumn?.name ?? toStage,
            borrowerEmail: undefined, // filled by drawer if needed
            borrowerPhone: undefined,
          });
        },
      }
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* Sortable columns */}
      <SortableContext
        items={CANONICAL_STAGES}
        strategy={horizontalListSortingStrategy}
      >
        <div className="pipeline-board">
          {columns.map((column) => (
            <PipelineColumn key={column.name} column={column} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
