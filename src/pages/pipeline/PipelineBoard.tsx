import { useMemo, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useQueries, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/toast";
import { useMoveApplication, usePipelineStages } from "@/features/pipeline/PipelineService";
import { PipelineCard as PipelineCardType, PipelineStage } from "@/features/pipeline/PipelineTypes";
import PipelineColumn from "./PipelineColumn";
import PipelineDrawer from "./PipelineDrawer";
import { getApplicationsByStage } from "@/lib/api";

function PipelineBoardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="w-80 flex-shrink-0 space-y-3">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-48 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PipelineBoard() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const stagesQuery = usePipelineStages();
  const moveMutation = useMoveApplication();

  const stageList: PipelineStage[] = stagesQuery.data ?? [];

  const applicationQueries = useQueries({
    queries: stageList.map((stage) => ({
      queryKey: ["stage-applications", stage.id],
      queryFn: () => getApplicationsByStage(stage.id),
      refetchInterval: 10000,
      onError: (error: Error) =>
        addToast({
          title: "Unable to load applications",
          description: error.message,
          variant: "destructive",
        }),
    })),
  }) as UseQueryResult<PipelineCardType[], Error>[];

  const pipeline = useMemo(() => {
    return stageList.reduce<Record<string, PipelineCardType[]>>((acc, stage, index) => {
      const cards = applicationQueries[index]?.data ?? [];
      acc[stage.id] = cards.map((card) => ({ ...card, stageId: card.stageId ?? stage.id }));
      return acc;
    }, {});
  }, [applicationQueries, stageList]);

  const isLoading =
    stagesQuery.isLoading ||
    (stageList.length > 0 && applicationQueries.some((query) => query.isLoading || query.isFetching));

  const applicationError = applicationQueries.find((query) => query.error)?.error as Error | undefined;
  const loadError = stagesQuery.error ?? applicationError;

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;

    const fromStage = source.droppableId;
    const toStage = destination.droppableId;

    if (fromStage === toStage && source.index === destination.index) return;

    const fromKey = ["stage-applications", fromStage];
    const toKey = ["stage-applications", toStage];

    const currentFrom = queryClient.getQueryData<PipelineCardType[]>(fromKey) ?? [];
    const currentTo = queryClient.getQueryData<PipelineCardType[]>(toKey) ?? [];

    const movingCard = currentFrom[source.index];
    if (!movingCard) return;

    const updatedCard = { ...movingCard, stageId: toStage };

    if (fromStage === toStage) {
      const reordered = [...currentFrom];
      reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, updatedCard);
      queryClient.setQueryData(fromKey, reordered);
    } else {
      const nextFrom = [...currentFrom];
      nextFrom.splice(source.index, 1);
      const nextTo = [...currentTo];
      nextTo.splice(destination.index, 0, updatedCard);
      queryClient.setQueryData(fromKey, nextFrom);
      queryClient.setQueryData(toKey, nextTo);
    }

    moveMutation.mutate(
      { appId: movingCard.applicationId, stageId: toStage },
      {
        onError: () => {
          queryClient.setQueryData(fromKey, currentFrom);
          queryClient.setQueryData(toKey, currentTo);
        },
      }
    );
  };

  if (isLoading) {
    return <PipelineBoardSkeleton />;
  }

  if (loadError) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Unable to load pipeline: {loadError.message}
      </div>
    );
  }

  if (stageList.length === 0) {
    return (
      <div className="rounded border border-slate-200 bg-white p-6 text-slate-700">
        No pipeline stages available.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <ScrollArea className="w-full">
          <div className="flex min-h-[420px] gap-4 pb-6">
            {stageList.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                applications={pipeline[stage.id] ?? []}
                onOpen={setSelectedAppId}
              />
            ))}
          </div>
        </ScrollArea>
      </DragDropContext>

      <PipelineDrawer
        appId={selectedAppId}
        open={Boolean(selectedAppId)}
        onClose={() => setSelectedAppId(null)}
      />
    </div>
  );
}
