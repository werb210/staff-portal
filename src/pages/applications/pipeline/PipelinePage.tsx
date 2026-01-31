import { useEffect, useMemo, useState } from "react";
import { DndContext, DragOverlay, closestCenter, type DragStartEvent } from "@dnd-kit/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import ErrorBanner from "@/components/ui/ErrorBanner";
import AppLoading from "@/components/layout/AppLoading";
import PipelineColumn from "./PipelineColumn";
import PipelineFilters from "./PipelineFilters";
import PipelineCard from "./PipelineCard";
import {
  buildStageLabelMap,
  sortPipelineStages,
  type PipelineApplication,
  type PipelineStageId,
  type PipelineDragEndEvent,
  type PipelineStage
} from "./pipeline.types";
import {
  clearDraggingState,
  createPipelineDragEndHandler,
  createPipelineDragStartHandler,
  usePipelineStore
} from "./pipeline.store";
import { useSilo } from "@/hooks/useSilo";
import ApplicationDrawer from "@/pages/applications/drawer/ApplicationDrawer";
import { pipelineApi } from "./pipeline.api";

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
  const [dragError, setDragError] = useState<string | null>(null);
  const {
    data: stages = [],
    isLoading: stagesLoading
  } = useQuery<PipelineStage[]>({
    queryKey: ["pipeline", "stages"],
    queryFn: async ({ signal }) => {
      try {
        const result = await pipelineApi.fetchStages({ signal });
        return result;
      } catch (error) {
        if (signal?.aborted) {
          return [];
        }
        return [];
      }
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false
  });

  const orderedStages = useMemo(() => sortPipelineStages(stages), [stages]);
  const stageLabelMap = useMemo(() => buildStageLabelMap(orderedStages), [orderedStages]);
  const stageTerminalMap = useMemo(
    () => new Map(orderedStages.map((stage) => [stage.id, Boolean(stage.terminal)])),
    [orderedStages]
  );

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
      setDragError(null);
    }
  };

  const dragEndHandler = useMemo(
    () =>
      createPipelineDragEndHandler({
        queryClient,
        filters,
        stages: orderedStages,
        onInvalidMove: setDragError
      }),
    [queryClient, filters, orderedStages]
  );

  const handleDragEnd = async (event: PipelineDragEndEvent) => {
    try {
      await dragEndHandler(event);
    } catch (error) {
      console.error("Pipeline drag end failed", { error });
    }
    setActiveCard(null);
    setActiveStage(null);
    clearDraggingState(setDragging)();
  };

  useEffect(() => {
    if (!orderedStages.length) return;
    if (!selectedStageId || !stageLabelMap[selectedStageId]) {
      setSelectedStageId(orderedStages[0].id);
    }
  }, [orderedStages, selectedStageId, setSelectedStageId, stageLabelMap]);

  useEffect(() => () => resetPipeline(), [resetPipeline]);

  if (silo !== "BF") {
    return <NoPipelineAvailable silo={silo} />;
  }

  return (
    <div className="pipeline-page">
      <Card title="Application Pipeline">
        <PipelineFilters />
        {stagesLoading && <AppLoading />}
        {dragError && <ErrorBanner message={dragError} />}
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="pipeline-columns">
            {orderedStages.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                stages={orderedStages}
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
            {activeCard ? (
              <PipelineCard
                card={activeCard}
                stageId={activeStage ?? ""}
                stageLabel={stageLabelMap[activeStage ?? ""] ?? "Unknown stage"}
                isTerminalStage={stageTerminalMap.get(activeStage ?? "") ?? false}
                onClick={handleCardClick}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </Card>
      <ApplicationDrawer />
    </div>
  );
};

export default PipelinePage;
