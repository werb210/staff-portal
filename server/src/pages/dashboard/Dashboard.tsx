import { useEffect, useState } from "react";
import { fetchPipeline } from "@/lib/api/pipeline";
import { fetchApplications } from "@/lib/api/applications";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({
    applications: 0,
    pipeline: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [apps, pipe] = await Promise.allSettled([
          fetchApplications(),
          fetchPipeline()
        ]);
        if (cancelled) return;

        const applications =
          apps.status === "fulfilled" && Array.isArray(apps.value)
            ? apps.value.length
            : 0;
        const pipeline =
          pipe.status === "fulfilled" && Array.isArray(pipe.value)
            ? pipe.value.length
            : 0;

        setSummary({ applications, pipeline });
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load dashboard");
        }
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
      <h1 className="bf-page-title">Dashboard</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="bf-error">{error}</div>}

      {!loading && !error && (
        <div className="bf-grid">
          <div className="bf-card">
            <div className="bf-card-label">Active Applications</div>
            <div className="bf-card-value">{summary.applications}</div>
          </div>
          <div className="bf-card">
            <div className="bf-card-label">Pipeline Deals</div>
            <div className="bf-card-value">{summary.pipeline}</div>
          </div>
        </div>
      )}
    </div>
  );
}
