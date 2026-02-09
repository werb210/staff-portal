import type { PipelineApplication, PipelineStageId } from "./pipeline.types";
import { PIPELINE_STAGE_LABELS, normalizeStageId } from "./pipeline.types";
import { getProcessingStatus } from "@/pages/applications/utils/processingStatus";

type PipelineCardProps = {
  card: PipelineApplication;
  stageId: PipelineStageId;
  onClick: (id: string) => void;
};

const formatAmount = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
};

const formatTimeAgo = (value?: string) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 60_000) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
};

const PipelineCard = ({ card, stageId, onClick }: PipelineCardProps) => {
  const handleClick = () => onClick(card.id);

  const updatedAtLabel = `Updated ${formatTimeAgo(card.updatedAt ?? card.createdAt)} ago`;
  const normalizedStage = normalizeStageId(stageId);
  const isDocumentsRequired = normalizedStage === "DOCUMENTSREQUIRED";
  const stageWarningLabel = PIPELINE_STAGE_LABELS.DOCUMENTSREQUIRED;
  const processingStatus = getProcessingStatus({
    ocrCompletedAt: (card as { ocr_completed_at?: string | null } | null)?.ocr_completed_at,
    bankingCompletedAt: (card as { banking_completed_at?: string | null } | null)?.banking_completed_at
  });

  return (
    <div
      onClick={handleClick}
      className="pipeline-card pipeline-card--readonly"
      aria-label={`${card.businessName ?? "Application"} in ${stageId}`}
    >
      <div className="pipeline-card__header">
        <div>
          <div className="pipeline-card__title">{card.businessName ?? "Unknown business"}</div>
          <div className="pipeline-card__subtitle">{card.productCategory ?? "Unspecified"}</div>
        </div>
        <div className="pipeline-card__amount">{formatAmount(card.requestedAmount)}</div>
      </div>
      <div className="pipeline-card__meta">
        {isDocumentsRequired ? (
          <span className="pipeline-card__pill pipeline-card__pill--warning">{stageWarningLabel}</span>
        ) : null}
        {processingStatus ? (
          <span className="pipeline-card__pill pipeline-card__pill--muted">{processingStatus.badge}</span>
        ) : null}
      </div>
      <div className="pipeline-card__footer">{updatedAtLabel}</div>
    </div>
  );
};

export default PipelineCard;
