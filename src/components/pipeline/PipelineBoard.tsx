import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMoveApplication, usePipelineApplications, usePipelineStages } from "@/hooks/pipeline";
import { PipelineStage } from "@/features/pipeline/PipelineTypes";

import { PipelineDrawer } from "./drawer";
import PipelineColumn from "./PipelineColumn";

export function PipelineBoard() {
  const {
    data: stages = [],
    isLoading,
    error,
    refetch,
  } = usePipelineStages();

  const firstStageId = stages[0]?.id;
  const primedApplications = usePipelineApplications(firstStageId);
  const moveMutation = useMoveApplication();

  const notifyError = useCallback((message: string) => {
    toast(message);
  }, []);

  useEffect(() => {
    if (error) {
      notifyError(error.message);
    }
  }, [error, notifyError]);

  useEffect(() => {
    if (moveMutation.error) {
      notifyError(moveMutation.error.message);
    }
  }, [moveMutation.error, notifyError]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="text-lg font-semibold">Loading pipeline…</CardHeader>
        <CardContent className="text-sm text-slate-600">Please wait while we load pipeline stages.</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-amber-900">Unable to load pipeline</p>
            <p className="text-sm text-amber-800">{error.message}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardHeader>
      </Card>
    );
  }

  if (stages.length === 0) {
    return (
      <Card>
        <CardHeader className="text-lg font-semibold">Pipeline</CardHeader>
        <CardContent className="text-sm text-slate-600">No pipeline stages available.</CardContent>
      </Card>
    );
  }

  return (
    <>
      <ScrollArea className="w-full">
        <div className={cn("grid", "grid-cols-[repeat(auto-fit,minmax(350px,1fr))]", "gap-6 pb-4")}>
          {stages.map((stage: PipelineStage) => (
            <PipelineColumn stage={stage} key={stage.id} />
          ))}
        </div>
        <div className="sr-only">{primedApplications.data?.length ?? 0} applications cached</div>
      </ScrollArea>
      <PipelineDrawer />
    </>
  );
}

export default PipelineBoard;
