import { useEffect, useMemo, useState } from "react";
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
import ApplicationDrawer from "@/pages/applications/drawer/ApplicationDrawer";

const NoPipelineAvailable = ({ silo }: { silo: string }) => (
  <div className="pipeline-empty">Pipeline is not available for the {silo} silo.</div>
);

const PipelinePage = () => {
  const { silo } = useSilo();
  const queryClient = useQueryClient();
  const filters = usePipelineStore((state) => state.currentFilters);
  const draggingFromStage = usePipelineStore((state) => state.draggingFromStage);
  const selectedApplicationId = usePipelineStore((state) => state.selectedApplicationId);
  const selectedStageId = usePipelineStore((state) => state.selectedStageId);
  const setDragging = usePipelineStore((state) => state.setDragging);
  const selectApplication = usePipelineStore((state) => state.selectApplication);
  const setSelectedStageId = usePipelineStore((state) => state.setSelectedStageId);
  const resetPipeline = usePipelineStore((state) => state.resetPipeline);

  const [activeCard, setActiveCard] = useState<PipelineApplication | null>(null);
  const [activeStage, setActiveStage] = useState<PipelineStageId | null>(null);

  const handleCardClick = (id: string, stageId: PipelineStageId) => selectApplication(id, stageId);

  const handleStageSelect = (stageId: PipelineStageId) => {
    setSelectedStageId(stageId);
  };

  const handleInvalidSelection = (stageId: PipelineStageId) => {
    if (selectedStageId !== stageId) return;
    selectApplication(null);
  };

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

  useEffect(() => () => resetPipeline(), [resetPipeline]);

  if (silo !== "BF") {
    return <NoPipelineAvailable silo={silo} />;
  }

  return (
    <div className="pipeline-page">
      <Card title="Application Pipeline">
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
                onStageSelect={handleStageSelect}
                onSelectionInvalid={handleInvalidSelection}
                selectedApplicationId={selectedApplicationId}
                selectedStageId={selectedStageId}
                activeCard={activeCard}
                draggingFromStage={draggingFromStage}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard ? <PipelineCard card={activeCard} stageId={activeStage ?? "received"} onClick={handleCardClick} /> : null}
          </DragOverlay>
        </DndContext>
      </Card>
      <ApplicationDrawer />
    </div>
  );
};

export default PipelinePage;
