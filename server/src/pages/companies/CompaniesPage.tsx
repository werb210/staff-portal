import { useEffect, useState } from "react";
import { fetchCompanies } from "@/lib/api/companies";

type Company = {
  id: string;
  name?: string;
  city?: string;
  province?: string;
};

export default function CompaniesPage() {
  const [rows, setRows] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCompanies();
        if (!cancelled) {
          setRows(
            (data as any[]).map((c) => ({
              id: c.id ?? c.companyId ?? String(Math.random()),
              name: c.name ?? c.legalName ?? "",
              city: c.city ?? "",
              province: c.province ?? c.state ?? ""
            }))
          );
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load companies");
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
      <h1 className="bf-page-title">Companies</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="bf-error">{error}</div>}
      {!loading && !error && (
        <table className="bf-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Province</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.city}</td>
                <td>{c.province}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
