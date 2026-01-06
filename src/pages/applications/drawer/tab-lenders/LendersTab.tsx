import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchLenderMatches, sendToLenders, type LenderMatch } from "@/api/lenders";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { getErrorMessage } from "@/utils/errors";

const LendersTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const { data: matches = [], isLoading, error } = useQuery<LenderMatch[]>({
    queryKey: ["lenders", applicationId, "matches"],
    queryFn: ({ signal }) => fetchLenderMatches(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  const [selected, setSelected] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: () => sendToLenders(applicationId ?? "", selected),
    onSuccess: () => setSelected([])
  });

  const toggleSelection = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view lenders.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading lenders…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load lenders.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__lenders">
      <div className="drawer-section">
        <div className="drawer-section__title">Recommended Lenders</div>
        {matches.length ? (
          <ul className="drawer-list">
            {matches.map((match) => (
              <li key={match.id} className="lender-row">
                <label>
                  <input type="checkbox" checked={selected.includes(match.id)} onChange={() => toggleSelection(match.id)} />
                  <span className="lender-row__name">{match.lenderName}</span>
                </label>
                <div className="lender-row__meta">
                  <div>Product: {match.productCategory ?? "—"}</div>
                  <div>Terms: {match.terms ?? "—"}</div>
                  <div>Docs: {match.requiredDocsStatus ?? "—"}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="drawer-placeholder">No lenders available.</div>
        )}
      </div>
      <div className="drawer-footer-actions">
        <button className="btn btn--primary" type="button" onClick={() => mutation.mutate()} disabled={!selected.length}>
          Send Application to Selected Lenders
        </button>
      </div>
    </div>
  );
};

export default LendersTab;
