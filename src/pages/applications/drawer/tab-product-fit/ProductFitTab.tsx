import { useApplicationDetails } from "@/pages/applications/hooks/useApplicationDetails";
import { DetailSection } from "@/pages/applications/ApplicationDetails";
import type { ApplicationMatchScore } from "@/types/application.types";
import { getErrorMessage } from "@/utils/errors";

const renderMatchValue = (value: ApplicationMatchScore["matchPercentage"]) => {
  if (value == null || value === "") return "Pending";
  return typeof value === "number" ? `${value}%` : `${value}%`;
};

const ProductFitTab = () => {
  const { applicationId, data: details, isLoading, error } = useApplicationDetails();

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view product fit.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading product fit…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load product fit.")}</div>;

  const matchScores = details?.matchScores ?? [];

  return (
    <div className="drawer-tab drawer-tab__product-fit">
      <DetailSection title="Product Fit" data={details?.productFit ?? null} />
      <div className="drawer-section">
        <div className="drawer-section__title">Match Scores</div>
        <div className="drawer-section__body">
          {matchScores.length ? (
            <div className="drawer-list">
              {matchScores.map((score, index) => (
                <div key={score.productId ?? `${score.productName ?? "product"}-${index}`} className="drawer-list__item">
                  <div className="drawer-kv-list">
                    <div className="drawer-kv-list__item">
                      <dt>Product</dt>
                      <dd>{score.productName ?? score.productId ?? "Unlabeled product"}</dd>
                    </div>
                    <div className="drawer-kv-list__item">
                      <dt>Match</dt>
                      <dd>{renderMatchValue(score.matchPercentage)}</dd>
                    </div>
                    {score.status ? (
                      <div className="drawer-kv-list__item">
                        <dt>Status</dt>
                        <dd>{score.status}</dd>
                      </div>
                    ) : null}
                    {score.notes ? (
                      <div className="drawer-kv-list__item">
                        <dt>Notes</dt>
                        <dd>{score.notes}</dd>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="drawer-placeholder">No match scores provided.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFitTab;
