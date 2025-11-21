import { Draggable } from "react-beautiful-dnd";

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { PipelineApplication } from "./pipeline.api";

type PipelineCardProps = {
  application: PipelineApplication;
  index: number;
};

export function PipelineCard({ application, index }: PipelineCardProps) {
  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn("transition", snapshot.isDragging && "rotate-0 scale-[1.01]")}
        >
          <Card
            className={cn(
              "border-slate-200 shadow-sm transition hover:shadow-md",
              snapshot.isDragging ? "ring-2 ring-indigo-200" : "ring-1 ring-transparent"
            )}
          >
            <CardHeader className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-tight text-slate-900">
                  {application.applicant ?? "Pending applicant"}
                </CardTitle>
                {application.status ? <Badge variant="outline">{application.status}</Badge> : null}
              </div>
              {application.role ? <CardDescription>{application.role}</CardDescription> : null}
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0 text-sm text-slate-600">
              {application.company ? (
                <div className="flex items-center justify-between gap-3 text-slate-700">
                  <span className="font-medium">{application.company}</span>
                  {typeof application.value === "number" ? (
                    <Badge variant="success">${application.value.toLocaleString()}</Badge>
                  ) : null}
                </div>
              ) : null}
              {application.location ? (
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{application.location}</p>
              ) : null}
              {application.updatedAt ? (
                <p className="text-xs text-slate-400">Updated {application.updatedAt}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
