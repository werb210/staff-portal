import { usePipelineDetailStore } from "@/state/pipelineDetailStore";

export default function TabBanking() {
  const banking = usePipelineDetailStore((s) => s.banking);

  if (!banking) {
    return <div className="text-gray-600">No banking analysis available.</div>;
  }

  const Section = ({ title, children }: any) => (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <div className="bg-white shadow rounded-lg p-4">{children}</div>
    </section>
  );

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: any;
  }) => (
    <div className="flex justify-between py-1 border-b border-gray-200">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* CORE METRICS */}
      <Section title="Core Bank Metrics">
        <Row label="Average Daily Balance" value={banking.avgDailyBalance} />
        <Row label="Average Monthly Revenue" value={banking.avgMonthlyRevenue} />
        <Row label="NSF Count (Last 90 Days)" value={banking.nsfCount90} />
        <Row label="Overdraft Days (Last 90 Days)" value={banking.overdraftDays90} />
        <Row label="Total Deposits (Last 90 Days)" value={banking.totalDeposits90} />
        <Row label="Largest Deposit" value={banking.largestDeposit} />
        <Row label="Monthly Deposit Volatility (%)" value={banking.depositVolatility} />
      </Section>

      {/* CASH FLOW PATTERNS */}
      <Section title="Cash Flow Patterns">
        <Row label="Revenue Trend (3 Mo)" value={banking.revenueTrend3mo} />
        <Row label="Expense Trend (3 Mo)" value={banking.expenseTrend3mo} />
        <Row label="Net Cash Flow (3 Mo Avg)" value={banking.netCashFlow} />
        <Row label="Negative Balance Days (3 Mo)" value={banking.negativeDays} />
      </Section>

      {/* RISK FLAGS */}
      <Section title="Risk Indicators">
        <Row label="NSF Risk Level" value={banking.nsfRiskLevel} />
        <Row label="Overdraft Risk" value={banking.overdraftRisk} />
        <Row label="Volatility Risk" value={banking.volatilityRisk} />
        <Row label="Cash Flow Stability" value={banking.cashFlowStability} />
      </Section>

      {/* RAW OCR OUTPUT */}
      <Section title="Raw OCR Extracted Fields">
        {banking.raw ? (
          <pre className="text-xs bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto max-h-80">
            {JSON.stringify(banking.raw, null, 2)}
          </pre>
        ) : (
          <div className="text-gray-600">No raw OCR data.</div>
        )}
      </Section>
    </div>
  );
}
