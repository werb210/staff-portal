import { useEffect, useState } from "react";
import { fetchPipeline } from "@/lib/api/pipeline";

type PipelineItem = {
  id: string;
  companyName?: string;
  stage?: string;
};

export default function PipelinePage() {
  const [rows, setRows] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPipeline();
        if (!cancelled) {
          setRows(
            (data as any[]).map((p) => ({
              id: p.id ?? p.dealId ?? String(Math.random()),
              companyName: p.companyName ?? "",
              stage: p.stage ?? p.status ?? ""
            }))
          );
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load pipeline");
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
      <h1 className="bf-page-title">Pipeline</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="bf-error">{error}</div>}
      {!loading && !error && (
        <table className="bf-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.companyName}</td>
                <td>{p.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
