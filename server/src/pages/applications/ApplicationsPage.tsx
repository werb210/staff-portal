import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApplications } from "@/lib/api/applications";

type Application = {
  id: string;
  companyName?: string;
  product?: string;
  status?: string;
};

export default function ApplicationsPage() {
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchApplications();
        if (!cancelled) {
          setRows(
            (data as any[]).map((a) => ({
              id: a.id ?? a.applicationId ?? String(Math.random()),
              companyName: a.companyName ?? "",
              product: a.product ?? a.productName ?? "",
              status: a.status ?? ""
            }))
          );
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load applications");
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
      <h1 className="bf-page-title">Applications</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="bf-error">{error}</div>}
      {!loading && !error && (
        <table className="bf-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Product</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link to={`/applications/${a.id}`}>{a.companyName}</Link>
                </td>
                <td>{a.product}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
