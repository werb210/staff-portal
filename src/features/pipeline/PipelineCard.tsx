import { Draggable } from "@hello-pangea/dnd";
import { PipelineCard, PipelineDocument } from "./PipelineTypes";

interface Props {
  index: number;
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

export default function PipelineCardComponent({ index, card, onOpen }: Props) {
  const docStatuses = card.documents ?? [];
  const rejectedCount = docStatuses.filter((doc) => doc.status === "rejected").length;
  const missingCount = docStatuses.filter((doc) => doc.status === "missing").length;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen?.(card.applicationId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen?.(card.applicationId);
            }
          }}
          tabIndex={0}
          role="button"
          className={`bg-white shadow rounded p-3 cursor-pointer border transition-colors ${
            snapshot.isDragging ? "border-blue-500" : "border-gray-200 hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{card.businessName}</p>
            <span className="text-xs text-gray-500">{card.applicationId}</span>
          </div>
          <p className="text-sm text-gray-600">{card.contactName}</p>
          <p className="text-sm text-gray-700">Product: {card.productType}</p>
          <p className="text-sm text-gray-700">
            Amount: ${card.amountRequested.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Updated {new Date(card.updatedAt).toLocaleDateString()}
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {docStatuses.length === 0 ? (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                Missing documents
              </span>
            ) : (
              docStatuses.slice(0, 3).map((doc) => (
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
        </div>
      )}
    </Draggable>
  );
}
