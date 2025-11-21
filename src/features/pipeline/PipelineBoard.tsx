import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ApplicationDrawer from "../applications/ApplicationDrawer";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import { getPipeline, moveCard } from "./PipelineService";
import { Pipeline, PipelineCard, PipelineStage } from "./PipelineTypes";
import PipelineColumns from "./PipelineColumns";
import { useToast } from "@/components/ui/toast";

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "requires_docs", label: "Requires Docs" },
  { key: "reviewing", label: "Reviewing" },
  { key: "ready_for_lenders", label: "Ready for Lenders" },
  { key: "sent_to_lenders", label: "Sent to Lenders" },
  { key: "funded", label: "Funded" },
  { key: "closed_withdrawn", label: "Closed / Withdrawn" },
];

const EMPTY_PIPELINE: Pipeline = {
  new: [],
  requires_docs: [],
  reviewing: [],
  ready_for_lenders: [],
  sent_to_lenders: [],
  funded: [],
  closed_withdrawn: [],
};

function normalizePipeline(data?: Pipeline | null): Pipeline {
  if (!data) return EMPTY_PIPELINE;

  return STAGES.reduce<Pipeline>((acc, stage) => {
    acc[stage.key] = data[stage.key] ?? [];
    return acc;
  }, { ...EMPTY_PIPELINE });
}

export default function PipelineBoard() {
  const queryClient = useQueryClient();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | undefined>();
  const { addToast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["pipeline"],
    queryFn: getPipeline,
    refetchInterval: 10000,
  });

  const pipeline = useMemo(() => normalizePipeline(data), [data]);

  const moveMutation = useMutation({
    mutationFn: ({
      appId,
      fromStage,
      toStage,
      positionIndex,
    }: {
      appId: string;
      fromStage: PipelineStage;
      toStage: PipelineStage;
      positionIndex: number;
    }) => moveCard(appId, fromStage, toStage, positionIndex),
    onSuccess: () => {
      addToast({ title: "Move saved", description: "Pipeline updated", variant: "success" });
    },
    onError: () => {
      addToast({ title: "Failed to move", description: "Reverting position", variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["pipeline"] }),
  });

  function findStageForCard(cardId: string, state: Pipeline): PipelineStage | null {
    const stage = STAGES.find(({ key }) => state[key]?.some((c) => c.id === cardId));
    return stage?.key ?? null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const current = queryClient.getQueryData<Pipeline>(["pipeline"]);
    if (!current) return;

    const fromStage = (active.data.current?.stage as PipelineStage | undefined) ??
      findStageForCard(active.id as string, current);
    const overStage = (over.data.current?.stage as PipelineStage | undefined) ??
      findStageForCard(over.id as string, current);

    if (!fromStage || !overStage) return;

    const sourceCards = current[fromStage] ?? [];
    const destinationCards = current[overStage] ?? [];
    const activeIndex = sourceCards.findIndex((card) => card.id === active.id);
    const overIndex = over.data.current?.sortable?.index ?? destinationCards.length;

    if (fromStage === overStage && activeIndex === overIndex) return;

    const movingCard = sourceCards[activeIndex];
    if (!movingCard) return;

    const optimistic: Pipeline = STAGES.reduce<Pipeline>((acc, stage) => {
      acc[stage.key] = [...(current[stage.key] ?? [])];
      return acc;
    }, { ...EMPTY_PIPELINE });

    optimistic[fromStage].splice(activeIndex, 1);

    const updatedCard: PipelineCard = { ...movingCard, stage: overStage };
    if (fromStage === overStage) {
      optimistic[overStage] = arrayMove(optimistic[overStage], activeIndex, overIndex);
    } else {
      optimistic[overStage].splice(overIndex, 0, updatedCard);
    }

    queryClient.setQueryData(["pipeline"], optimistic);

    moveMutation.mutate({
      appId: movingCard.applicationId,
      fromStage,
      toStage: overStage,
      positionIndex: overIndex,
    }, {
      onError: () => queryClient.setQueryData(["pipeline"], current),
    });
  }

  if (isLoading) {
    return <LoadingState label="Loading pipeline" />;
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={() => refetch()}
        message={`Failed to load pipeline: ${String(error)}`}
      />
    );
  }

  return (
    <div className="relative">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={STAGES.map((stage) => stage.key)}
          strategy={verticalListSortingStrategy}
        >
          <PipelineColumns
            pipeline={pipeline}
            stages={STAGES}
            onOpen={(id, stage) => {
              setSelectedStage(stage as PipelineStage);
              setSelectedAppId(id);
            }}
          />
        </SortableContext>
      </DndContext>

      {selectedAppId && (
        <ApplicationDrawer
          appId={selectedAppId}
          open={Boolean(selectedAppId)}
          onClose={() => setSelectedAppId(null)}
          stage={selectedStage}
        />
      )}
    </div>
  );
}
