import { useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMoveApplication, usePipelineApplications, usePipelineStages } from "@/hooks/pipeline";
import { PipelineCard as PipelineCardType } from "@/features/pipeline/PipelineTypes";

interface PipelineCardProps {
  application: PipelineCardType;
  onOpen?: (applicationId: string) => void;
}

function formatLastActivity(updatedAt: string) {
  const updatedDate = new Date(updatedAt);
  const diffMs = Date.now() - updatedDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function PipelineCard({ application, onOpen }: PipelineCardProps) {
  usePipelineStages();
  usePipelineApplications();
  const moveMutation = useMoveApplication();

  const handleOpen = useCallback(() => {
    const applicationId = application.applicationId ?? application.id;
    if (onOpen) {
      onOpen(applicationId);
      return;
    }
    toast("Opening application");
  }, [application.applicationId, application.id, onOpen]);

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData("text/plain", application.id);
      moveMutation.reset();
    },
    [application.id, moveMutation]
  );

  return (
    <Card
      draggable={true}
      onDragStart={handleDragStart}
      onClick={handleOpen}
      className={cn(
        "cursor-pointer rounded-xl border shadow-sm transition hover:shadow-md",
        "bg-white"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{application.businessName}</h3>
          <Button size="icon" variant="ghost" aria-label="Open pipeline drawer">
            ···
          </Button>
        </div>
        <p className="text-sm text-slate-600">Primary contact: {application.contactName}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span className="font-medium">Requested</span>
          <span>
            {application.amountRequested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            {application.currency ? ` ${application.currency}` : ""}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Product</span>
          <span>{application.productType}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Last activity</span>
          <span>{formatLastActivity(application.updatedAt)}</span>
        </div>
      </CardContent>
      <ScrollArea className="sr-only">{application.stageId}</ScrollArea>
    </Card>
  );
}

export default PipelineCard;
