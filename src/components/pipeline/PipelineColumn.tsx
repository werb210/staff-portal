import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMoveApplication, usePipelineApplications, usePipelineStages } from "@/hooks/pipeline";
import { PipelineCard as PipelineCardType, PipelineStage } from "@/features/pipeline/PipelineTypes";

import PipelineCard from "./PipelineCard";

type PipelineColumnProps = {
  stage: PipelineStage;
};

export function PipelineColumn({ stage }: PipelineColumnProps) {
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = usePipelineApplications(stage.id);

  usePipelineStages();
  const moveMutation = useMoveApplication();

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const draggedId = event.dataTransfer.getData("text/plain");
      if (!draggedId) return;

      moveMutation.mutate(
        { id: draggedId, stageId: stage.id },
        {
          onError: (err) => toast(err.message),
          onSuccess: () => toast("Application moved"),
        }
      );
    },
    [moveMutation, stage.id]
  );

  useEffect(() => {
    if (error) {
      toast(error.message);
    }
  }, [error]);

  return (
    <Card
      className={cn("h-full min-h-[24rem] border-slate-200 bg-white")}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">{stage.name}</p>
          <p className="text-xs text-slate-500">{applications.length} applications</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => refetch()}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="max-h-[70vh] pr-3">
          <div className="space-y-3">
            {isLoading && <p className="text-sm text-slate-500">Loading applications…</p>}
            {!isLoading && applications.length === 0 && (
              <p className="text-sm text-slate-500">No applications in this stage.</p>
            )}
            {applications.map((app: PipelineCardType) => (
              <PipelineCard application={app} key={app.id ?? app.applicationId} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default PipelineColumn;
