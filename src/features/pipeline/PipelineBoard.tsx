import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { useQueries, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import ApplicationDrawer from "../applications/ApplicationDrawer";
import LoadingState from "@/components/states/LoadingState";
import ErrorState from "@/components/states/ErrorState";
import PipelineColumns from "./PipelineColumns";
import { useToast } from "@/components/ui/toast";
import { Pipeline, PipelineCard } from "./PipelineTypes";
import { fetchPipelineApplications, useMoveApplication, usePipelineStages } from "@/hooks/pipeline";

export default function PipelineBoard() {
  const queryClient = useQueryClient();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | undefined>();
  const { addToast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const stagesQuery = usePipelineStages();

  const applicationQueries = useQueries({
    queries: (stagesQuery.data ?? []).map((stage) => ({
      queryKey: ["pipeline-applications", stage.id],
      queryFn: () => fetchPipelineApplications(stage.id),
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : "Unable to load applications";
        addToast({
          title: "Unable to load applications",
          description: message,
          variant: "destructive",
        });
      },
    })),
  }) as UseQueryResult<PipelineCard[], Error>[];

  const pipeline = useMemo(() => {
    if (!stagesQuery.data) return {} as Pipeline;

    return stagesQuery.data.reduce<Pipeline>((acc, stage, idx) => {
      const cards = applicationQueries[idx]?.data ?? [];
      acc[stage.id] = cards.map((card) => ({ ...card, stageId: card.stageId ?? stage.id }));
      return acc;
    }, {} as Pipeline);
  }, [applicationQueries, stagesQuery.data]);

  const moveMutation = useMoveApplication();

  function findStageForCard(cardId: string, state: Pipeline): string | null {
    const entry = Object.entries(state).find(([, cards]) => cards.some((c) => c.id === cardId));
    return entry?.[0] ?? null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const fromStage = (active.data.current?.stage as string | undefined) ??
      findStageForCard(active.id as string, pipeline);
    const overStage = (over.data.current?.stage as string | undefined) ??
      findStageForCard(over.id as string, pipeline);

    if (!fromStage || !overStage) return;

    const currentFrom = queryClient.getQueryData<PipelineCard[]>(["pipeline-applications", fromStage]) ?? [];
    const currentTo = queryClient.getQueryData<PipelineCard[]>(["pipeline-applications", overStage]) ?? [];

    const activeIndex = currentFrom.findIndex((card) => card.id === active.id);
    const overIndex = over.data.current?.sortable?.index ?? currentTo.length;

    if (fromStage === overStage && activeIndex === overIndex) return;

    const movingCard = currentFrom[activeIndex];
    if (!movingCard) return;

    const optimisticFrom = [...currentFrom];
    const optimisticTo = [...currentTo];

    optimisticFrom.splice(activeIndex, 1);

    const updatedCard: PipelineCard = { ...movingCard, stageId: overStage };
    if (fromStage === overStage) {
      const reordered = arrayMove(optimisticTo, activeIndex, overIndex);
      queryClient.setQueryData(["pipeline-applications", fromStage], reordered);
    } else {
      optimisticTo.splice(overIndex, 0, updatedCard);
      queryClient.setQueryData(["pipeline-applications", fromStage], optimisticFrom);
      queryClient.setQueryData(["pipeline-applications", overStage], optimisticTo);
    }

    moveMutation.mutate(
      { id: movingCard.applicationId, stageId: overStage },
      {
        onError: () => {
          queryClient.setQueryData(["pipeline-applications", fromStage], currentFrom);
          queryClient.setQueryData(["pipeline-applications", overStage], currentTo);
        },
      }
    );
  }

  const isLoading =
    stagesQuery.isLoading || applicationQueries.some((query) => query.isLoading || query.isFetching);
  const applicationError = applicationQueries.find((query) => query.isError)?.error as Error | undefined;

  if (isLoading) {
    return <LoadingState label="Loading pipeline" />;
  }

  if (stagesQuery.isError || applicationError) {
    const message = stagesQuery.error?.message ?? applicationError?.message ?? "Failed to load pipeline";
    return (
      <ErrorState
        onRetry={() => {
          stagesQuery.refetch();
          applicationQueries.forEach((query) => query.refetch?.());
        }}
        message={message}
      />
    );
  }

  return (
    <div className="relative">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={(stagesQuery.data ?? []).map((stage) => stage.id)}
          strategy={verticalListSortingStrategy}
        >
          <PipelineColumns
            pipeline={pipeline}
            stages={stagesQuery.data ?? []}
            onOpen={(id, stage) => {
              setSelectedStage(stage);
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
