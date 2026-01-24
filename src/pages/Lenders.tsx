import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Lender = {
  id: string;
  name?: string | null;
  country?: string | null;
  products?: any[] | null;
  submission_method?: any[] | null;
};

export default function Lenders() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api.get("/lenders")
      .then(res => {
        if (!mounted) return;

        const raw = Array.isArray(res.data) ? res.data : [];

        // HARD NORMALIZATION (prevents crashes)
        const normalized: Lender[] = raw.map((l: any) => ({
          id: l.id ?? l.lender_id,
          name: l.name ?? "—",
          country: l.country ?? null,
          products: Array.isArray(l.products) ? l.products : [],
          submission_method: Array.isArray(l.submission_method)
            ? l.submission_method
            : [],
        }));

        setLenders(normalized);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lenders load failed", err);
        setError("Failed to load lenders");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading lenders…</div>;
  if (error) return <div>{error}</div>;
  if (!Array.isArray(lenders) || lenders.length === 0) {
    return <div>No lenders found</div>;
  }

  return (
    <div>
      <h1>Lenders</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Country</th>
            <th>Products</th>
            <th>Submission Methods</th>
          </tr>
        </thead>
        <tbody>
          {lenders.map(l => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.country?.toUpperCase() ?? "—"}</td>
              <td>{l.products?.length ?? 0}</td>
              <td>{l.submission_method?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
