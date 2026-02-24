import { useEffect, useState } from "react";
import { biGetReportSummary } from "../../../api/biClient";

interface ReportSummary {
  totalApplications: number;
  policiesIssued: number;
  conversionRate: number;
  premiumVolume: number;
  commissionOutstanding: number;
  claimsRatio: number;
  referralCount: number;
  lenderCount: number;
}

export default function BIReports() {
  const [metrics, setMetrics] = useState<ReportSummary | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const data = await biGetReportSummary();
    setMetrics(data as ReportSummary);
  }

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="report-wrapper">
      <h2>Boreal Insurance Reports</h2>

      <div className="kpi-grid">
        <KPI title="Applications (Total)" value={metrics.totalApplications} />
        <KPI title="Policies Issued" value={metrics.policiesIssued} />
        <KPI title="Conversion Rate" value={`${metrics.conversionRate}%`} />

        <KPI
          title="Premium Volume"
          value={`$${metrics.premiumVolume.toLocaleString()}`}
        />

        <KPI
          title="Commission Outstanding"
          value={`$${metrics.commissionOutstanding.toLocaleString()}`}
        />

        <KPI title="Claims Ratio" value={`${metrics.claimsRatio}%`} />

        <KPI title="Referral Volume" value={metrics.referralCount} />

        <KPI title="Lender Volume" value={metrics.lenderCount} />
      </div>

      <button
        style={{ marginTop: "30px" }}
        onClick={() => {
          window.location.href = "/bi/reports/commission";
        }}
      >
        View Detailed Commission Ledger
      </button>
    </div>
  );
}

function KPI({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="kpi-card">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
}
