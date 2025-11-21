import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { PipelineCard, PipelineDocument } from "./PipelineTypes";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Props {
  card: PipelineCard;
  onOpen?: (applicationId: string) => void;
}

function badgeClass(status: PipelineDocument["status"]) {
  switch (status) {
    case "accepted":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "missing":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function PipelineCardComponent({ card, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { stage: card.stage, card },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const docStatuses = card.documents ?? [];
  const rejectedCount = docStatuses.filter((doc) => doc.status === "rejected").length;
  const missingCount = docStatuses.filter((doc) => doc.status === "missing").length;

  const docsUploaded = card.docsUploaded ?? card.documentCompletion ?? 0;
  const docsRequired = card.docsRequired ?? 0;
  const completionPercent = card.documentCompletion ??
    (docsRequired > 0 ? Math.min(100, (docsUploaded / docsRequired) * 100) : 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen?.(card.applicationId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(card.applicationId);
        }
      }}
      tabIndex={0}
      role="button"
      className={`bg-white shadow rounded p-3 cursor-pointer border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDragging ? "border-blue-500" : "border-gray-200 hover:border-blue-400"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{card.businessName}</p>
        <span className="text-xs text-gray-500">{card.applicationId}</span>
      </div>
      <p className="text-sm text-gray-600">Applicant: {card.contactName}</p>
      <p className="text-sm text-gray-700">Product: {card.productType}</p>
      <p className="text-sm text-gray-700">Amount requested: ${card.amountRequested.toLocaleString()}</p>
      <p className="text-sm text-gray-700">Docs: {docsUploaded}/{docsRequired || "?"}</p>
      <p className="text-xs text-gray-500 mt-1">Last activity {new Date(card.updatedAt).toLocaleString()}</p>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Document completion</span>
          <span>{Math.round(completionPercent)}%</span>
        </div>
        <Progress value={completionPercent} />
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {docStatuses.length === 0 ? (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            Missing documents
          </span>
        ) : (
          docStatuses.slice(0, 2).map((doc) => (
            <span
              key={doc.id}
              className={`text-[11px] px-2 py-1 rounded-full ${badgeClass(doc.status)}`}
            >
              {doc.name}: {doc.status}
            </span>
          ))
        )}
        {rejectedCount > 0 && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-red-100 text-red-700">
            {rejectedCount} rejected
          </span>
        )}
        {missingCount > 0 && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            {missingCount} missing
          </span>
        )}
      </div>

      <div className="mt-2 flex gap-2 flex-wrap">
        {card.ocrStatus && (
          <Badge variant={card.ocrStatus === "completed" ? "outline" : "secondary"}>
            OCR: {card.ocrStatus}
          </Badge>
        )}
        {card.bankingStatus && <Badge variant="secondary">Banking: {card.bankingStatus}</Badge>}
        {typeof card.likelihoodScore === "number" && (
          <Badge variant="success">Likelihood {Math.round(card.likelihoodScore)}%</Badge>
        )}
        {card.hasMissingDocs && <Badge variant="outline">Missing docs</Badge>}
        {card.hasOcrConflicts && <Badge variant="destructive">OCR conflict</Badge>}
        {card.hasBankingAnomalies && <Badge variant="secondary">Banking anomalies</Badge>}
      </div>
    </div>
  );
}
