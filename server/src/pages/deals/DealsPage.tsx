import { useEffect, useState } from "react";
import { fetchDeals } from "@/lib/api/deals";

type Deal = {
  id: string;
  companyName?: string;
  amount?: number;
  status?: string;
};

export default function DealsPage() {
  const [rows, setRows] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDeals();
        if (!cancelled) {
          setRows(
            (data as any[]).map((d) => ({
              id: d.id ?? d.dealId ?? String(Math.random()),
              companyName: d.companyName ?? d.borrowerName ?? "",
              amount: d.amount ?? d.requestedAmount ?? 0,
              status: d.status ?? d.stage ?? ""
            }))
          );
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load deals");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bf-page">
      <h1 className="bf-page-title">Deals</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="bf-error">{error}</div>}
      {!loading && !error && (
        <table className="bf-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td>{d.companyName}</td>
                <td>{d.amount?.toLocaleString?.() ?? d.amount}</td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
