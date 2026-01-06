import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBankingSummary, type BankingSummary } from "@/api/banking";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { getErrorMessage } from "@/utils/errors";

const Metric = ({ label, value }: { label: string; value?: number }) => (
  <div className="drawer-metric">
    <div className="drawer-metric__label">{label}</div>
    <div className="drawer-metric__value">{value !== undefined ? value : "—"}</div>
  </div>
);

const BankingTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const { data: summary, isLoading, error } = useQuery<BankingSummary>({
    queryKey: ["banking", applicationId, "summary"],
    queryFn: ({ signal }) => fetchBankingSummary(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  const trend = useMemo(() => summary?.revenueTrend ?? [], [summary]);

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view banking analysis.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading banking analysis…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load banking analysis.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__banking">
      <div className="drawer-metric-grid">
        <Metric label="Avg Monthly Revenue" value={summary?.avgMonthlyRevenue} />
        <Metric label="Avg Monthly Expenses" value={summary?.avgMonthlyExpenses} />
        <Metric label="Burn Rate" value={summary?.burnRate} />
        <Metric label="Days Cash on Hand" value={summary?.daysCashOnHand} />
        <Metric label="NSF Count" value={summary?.nsfCount} />
        <Metric label="Volatility Index" value={summary?.volatilityIndex} />
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Revenue Trend</div>
        {trend.length ? (
          <ul className="drawer-list">
            {trend.map((point) => (
              <li key={point.month}>
                <strong>{point.month}:</strong> {point.revenue}
              </li>
            ))}
          </ul>
        ) : (
          <div className="drawer-placeholder">No revenue trend data.</div>
        )}
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Largest Deposits</div>
        {summary?.largestDeposits?.length ? (
          <ul className="drawer-list">
            {summary.largestDeposits.map((deposit, idx) => (
              <li key={idx}>
                {deposit.date}: {deposit.amount} {deposit.description ? `— ${deposit.description}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <div className="drawer-placeholder">No deposit data.</div>
        )}
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Statement Coverage</div>
        {summary?.statementCoverage?.length ? (
          <div className="drawer-chip-row">
            {summary.statementCoverage.map((month) => (
              <span key={month} className="drawer-chip">
                {month}
              </span>
            ))}
          </div>
        ) : (
          <div className="drawer-placeholder">No statements detected.</div>
        )}
      </div>
    </div>
  );
};

export default BankingTab;
