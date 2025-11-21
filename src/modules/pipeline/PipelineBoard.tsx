import { useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";

import { PageLayout } from "../../components/layout/PageLayout";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { usePipelineStore } from "./pipeline.store";
import { PipelineColumn } from "./PipelineColumn";

export function PipelineBoard() {
  const stages = usePipelineStore((state) => state.stages);
  const isLoading = usePipelineStore((state) => state.isLoading);
  const error = usePipelineStore((state) => state.error);
  const fetchPipeline = usePipelineStore((state) => state.fetchPipeline);
  const moveCard = usePipelineStore((state) => state.moveCard);

  useEffect(() => {
    void fetchPipeline();
  }, [fetchPipeline]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { destination, source, draggableId } = result;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      await moveCard({
        applicationId: draggableId,
        sourceStageId: source.droppableId,
        destinationStageId: destination.droppableId,
        destinationIndex: destination.index,
      });
    } catch (err) {
      console.error("Failed to move application", err);
    }
  };

  return (
    <PageLayout
      title="Pipeline"
      description="Track application momentum and move deals forward with drag-and-drop."
      badge="Sales"
      actions={
        <Button variant="secondary" size="sm" onClick={() => void fetchPipeline()} disabled={isLoading}>
          Refresh
        </Button>
      }
    >
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Pipeline unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Applications</CardTitle>
            <CardDescription>Drag cards between stages to mirror the staff server flow.</CardDescription>
          </div>
          <Badge variant={isLoading ? "warning" : "success"}>
            {isLoading ? "Syncing" : "Synced"}
          </Badge>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stages.map((stage) => (
                <PipelineColumn key={stage.id} stage={stage} />
              ))}
            </div>
            {!isLoading && stages.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                No pipeline stages were returned from the API.
              </div>
            ) : null}
          </DragDropContext>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
