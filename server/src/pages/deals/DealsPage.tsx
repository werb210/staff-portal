import { useEffect, useState } from "react";
import { listDeals, Deal } from "@/api/deals";

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listDeals();
      setDeals(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Deals</h1>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Stage</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{(d as any).companyName ?? ""}</td>
                <td>{(d as any).stage ?? ""}</td>
                <td>{(d as any).amount ? `$${(d as any).amount}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
