import { Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { PipelineCard as PipelineCardType } from "@/features/pipeline/PipelineTypes";
import { cn } from "@/lib/utils";

interface PipelineCardProps {
  application: PipelineCardType;
  index: number;
  onOpen: (applicationId: string) => void;
}

function formatTimeSince(updatedAt: string) {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

export default function PipelineCard({ application, index, onOpen }: PipelineCardProps) {
  const amountFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const openCard = () => onOpen(application.applicationId);

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          tabIndex={0}
          role="button"
          onClick={openCard}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openCard();
            }
          }}
          className={cn(
            "cursor-grab select-none border border-slate-200 p-4 shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500",
            snapshot.isDragging && "border-blue-300 bg-blue-50 shadow-md",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-base font-semibold text-slate-900">{application.businessName}</h4>
              <p className="text-sm text-slate-600">Primary contact: {application.contactName}</p>
            </div>
            <span className="text-xs font-medium text-slate-500">{application.productType}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Requested</p>
              <p className="font-semibold text-slate-900">{amountFormatter.format(application.amountRequested)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Last activity</p>
              <p className="font-semibold text-slate-900">{formatTimeSince(application.updatedAt)}</p>
            </div>
          </div>
        </Card>
      )}
    </Draggable>
  );
}
