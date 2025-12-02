import { usePipelineDetailStore } from "@/state/pipelineDetailStore";
import clsx from "clsx";
import { ReactNode } from "react";

type BankingRow = { month?: string; [key: string]: any };

export default function TabBankingAnalysis() {
  const { banking } = usePipelineDetailStore();

  if (!banking || banking.length === 0) {
    return <div className="text-gray-700">No banking data available.</div>;
  }

  const grouped = groupByMonth(banking as BankingRow[]);

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([month, rows]) => (
        <MonthBlock key={month} month={month} rows={rows} />
      ))}
    </div>
  );
}

function groupByMonth(rows: BankingRow[]): Record<string, BankingRow[]> {
  const out: Record<string, BankingRow[]> = {};

  rows.forEach((row) => {
    const month = row.month || "Unknown";
    if (!out[month]) out[month] = [];
    out[month].push(row);
  });

  // Sort months newest → oldest
  return Object.fromEntries(
    Object.entries(out).sort((a, b) => b[0].localeCompare(a[0]))
  );
}

function MonthBlock({ month, rows }: { month: string; rows: BankingRow[] }) {
  return (
    <div className="border rounded-lg bg-white p-6 shadow">
      <h2 className="text-2xl font-semibold mb-3">{month}</h2>

      <Category title="Cashflow Health">
        <Metric name="Average Daily Balance" rows={rows} field="avg_daily_balance" isCurrency />
        <Metric name="Median Daily Balance" rows={rows} field="median_daily_balance" isCurrency />
        <Metric name="Lowest Balance" rows={rows} field="min_balance" isCurrency highlightNegative />
        <Metric name="Highest Balance" rows={rows} field="max_balance" isCurrency />
      </Category>

      <Category title="NSF / Returned Items">
        <Metric name="# of NSF Events" rows={rows} field="nsf_count" highlightHigh />
        <Metric name="Total NSF Fees" rows={rows} field="nsf_fees" isCurrency />
      </Category>

      <Category title="Spending Patterns">
        <Metric name="Avg Monthly Expenses" rows={rows} field="avg_expenses" isCurrency />
        <Metric name="Large Withdrawals" rows={rows} field="large_withdrawals" isCurrency />
      </Category>

      <Category title="Daily Balance Trends">
        <Metric name="# of Negative Days" rows={rows} field="negative_days" highlightHigh />
        <Metric name="# of Positive Days" rows={rows} field="positive_days" />
      </Category>

      <Category title="Deposits (Frequency & Quality)">
        <Metric name="Total Deposits" rows={rows} field="total_deposits" isCurrency />
        <Metric name="Deposit Count" rows={rows} field="deposit_count" />
        <Metric name="Avg Deposit" rows={rows} field="avg_deposit" isCurrency />
        <Metric name="Largest Deposit" rows={rows} field="largest_deposit" isCurrency />
      </Category>

      <Category title="Risk Flags">
        <Metric name="Risk Score" rows={rows} field="risk_score" highlightHigh />
        <Metric name="Risk Flags (Raw)" rows={rows} field="risk_flags" isRawList />
      </Category>
    </div>
  );
}

function Category({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function Metric({
  name,
  rows,
  field,
  isCurrency = false,
  isRawList = false,
  highlightNegative = false,
  highlightHigh = false,
}: {
  name: string;
  rows: BankingRow[];
  field: string;
  isCurrency?: boolean;
  isRawList?: boolean;
  highlightNegative?: boolean;
  highlightHigh?: boolean;
}) {
  const values = rows
    .map((r: BankingRow) => r[field])
    .filter((v: any) => v !== undefined && v !== null);

  if (values.length === 0) {
    return (
      <div className="p-3 border rounded bg-gray-50">
        <div className="text-sm font-semibold text-gray-600">{name}</div>
        <div className="text-gray-400 italic text-sm">—</div>
      </div>
    );
  }

  const formatted = values.map((v: any) => {
    if (isRawList && Array.isArray(v)) return v.join(", ");
    if (isCurrency) return `$${Number(v).toLocaleString()}`;
    return String(v);
  });

  const highRisk = highlightHigh && Math.max(...values.map(Number)) > 3;
  const negative = highlightNegative && Math.min(...values.map(Number)) < 0;

  return (
    <div
      className={clsx(
        "p-3 border rounded",
        (highRisk || negative) && "bg-red-100 border-red-400"
      )}
    >
      <div className="text-sm font-semibold text-gray-600">{name}</div>
      <div className="text-gray-900 text-sm">{formatted.join(", ")}</div>
    </div>
  );
}


