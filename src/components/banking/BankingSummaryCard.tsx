import { useBankingSummary } from "../../hooks/useBanking";

export default function BankingSummaryCard({ applicationId }: { applicationId: string }) {
  const { data, isLoading } = useBankingSummary(applicationId);

  if (isLoading) return <div>Loading banking summary…</div>;
  if (!data) return <div>No banking summary found.</div>;

  const summary = data.summary;

  return (
    <div className="p-4 border rounded bg-white shadow-sm space-y-3">
      <h2 className="text-xl font-semibold">Banking Summary</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-semibold">Average Balance</div>
          <div>${summary.averageBalance?.toLocaleString()}</div>
        </div>

        <div>
          <div className="font-semibold">Ending Balance</div>
          <div>${summary.endingBalance?.toLocaleString()}</div>
        </div>

        <div>
          <div className="font-semibold">NSFs (90 Days)</div>
          <div>{summary.nsfs_90d}</div>
        </div>

        <div>
          <div className="font-semibold">Deposits (90 Days)</div>
          <div>${summary.deposits_90d?.toLocaleString()}</div>
        </div>

        <div>
          <div className="font-semibold">Withdrawals (90 Days)</div>
          <div>${summary.withdrawals_90d?.toLocaleString()}</div>
        </div>

        <div>
          <div className="font-semibold">Revenue Estimate</div>
          <div>${summary.estimatedRevenue?.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
