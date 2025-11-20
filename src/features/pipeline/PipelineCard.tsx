import { PipelineCard } from "./PipelineTypes";

interface Props {
  card: PipelineCard;
  onDragStart: (card: PipelineCard) => void;
}

export default function PipelineCardComponent({ card, onDragStart }: Props) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(card)}
      className="bg-white shadow rounded p-3 cursor-grab border border-gray-200 hover:border-blue-400 transition-colors"
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
    </div>
  );
}
