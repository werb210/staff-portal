import { useMemo, useState } from "react";
import { DndContext, DragOverlay, closestCenter, type DragStartEvent } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import PipelineColumn from "./PipelineColumn";
import PipelineFilters from "./PipelineFilters";
import PipelineCard from "./PipelineCard";
import {
  PIPELINE_STAGES,
  type PipelineApplication,
  type PipelineStageId,
  type PipelineDragEndEvent
} from "./pipeline.types";
import {
  clearDraggingState,
  createPipelineDragEndHandler,
  createPipelineDragStartHandler,
  usePipelineStore
} from "./pipeline.store";
import { useSilo } from "@/hooks/useSilo";

const NoPipelineAvailable = ({ silo }: { silo: string }) => (
  <div className="pipeline-empty">Pipeline is not available for the {silo} silo.</div>
);

const PipelinePage = () => {
  const { silo } = useSilo();
  const queryClient = useQueryClient();
  const filters = usePipelineStore((state) => state.currentFilters);
  const draggingFromStage = usePipelineStore((state) => state.draggingFromStage);
  const setDragging = usePipelineStore((state) => state.setDragging);
  const setSelectedApplicationId = usePipelineStore((state) => state.setSelectedApplicationId);

  const [activeCard, setActiveCard] = useState<PipelineApplication | null>(null);
  const [activeStage, setActiveStage] = useState<PipelineStageId | null>(null);

  const handleCardClick = (id: string) => setSelectedApplicationId(id);

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card ?? null;
    const stageId = event.active.data.current?.stageId ?? null;
    if (card && stageId) {
      setActiveCard(card);
      setActiveStage(stageId);
      createPipelineDragStartHandler(setDragging)(card.id, stageId);
    }
  };

  const dragEndHandler = useMemo(
    () => createPipelineDragEndHandler({ queryClient, filters }),
    [queryClient, filters]
  );

  const handleDragEnd = async (event: PipelineDragEndEvent) => {
    await dragEndHandler(event);
    setActiveCard(null);
    setActiveStage(null);
    clearDraggingState(setDragging)();
  };

  if (silo !== "BF") {
    return <NoPipelineAvailable silo={silo} />;
  }

  return (
    <div className="pipeline-page">
      <Card title="Sales Pipeline">
        <PipelineFilters />
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="pipeline-columns">
            {PIPELINE_STAGES.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                filters={filters}
                onCardClick={handleCardClick}
                activeCard={activeCard}
                draggingFromStage={draggingFromStage}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard ? <PipelineCard card={activeCard} stageId={activeStage ?? "new"} onClick={handleCardClick} /> : null}
          </DragOverlay>
        </DndContext>
      </Card>
    </div>
  );
};

export default PipelinePage;
