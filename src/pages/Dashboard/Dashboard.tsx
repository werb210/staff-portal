import { useMemo } from 'react';
import { useApplications } from '../../hooks/api/useApplications';
import { usePipeline } from '../../hooks/api/usePipeline';
import { useRBAC } from '../../hooks/useRBAC';
import { getPipelineStagesForSilo } from '../../config/rbac';

export default function Dashboard() {
  const { data: apps, isLoading: appsLoading } = useApplications();
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline();
  const { user } = useRBAC();

  const metrics = useMemo(() => {
    const total = apps?.length ?? 0;
    const funded = apps?.filter((app) => app.status?.toLowerCase() === 'funded').length ?? 0;
    const pending = total - funded;
    return { total, funded, pending };
  }, [apps]);

  const siloStages = user ? getPipelineStagesForSilo(user.silo) : [];

  if (appsLoading || pipelineLoading) {
    return <div className="card loading-state">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <section className="dashboard__metrics">
        <article className="card">
          <h2>Total Applications</h2>
          <p className="metric">{metrics.total}</p>
        </article>
        <article className="card">
          <h2>Funded</h2>
          <p className="metric metric--success">{metrics.funded}</p>
        </article>
        <article className="card">
          <h2>In Progress</h2>
          <p className="metric metric--warning">{metrics.pending}</p>
        </article>
      </section>
      <section className="card">
        <header className="card__header">
          <h2>Pipeline Snapshot</h2>
          <span>{user?.silo} stages</span>
        </header>
        <div className="pipeline-snapshot">
          {pipeline?.map((stage) => (
            <div key={stage.id} className="pipeline-snapshot__stage">
              <h3>{stage.name}</h3>
              <p>{stage.applications?.length ?? 0} applications</p>
            </div>
          ))}
          {pipeline?.length === 0 && (
            <p>No pipeline data yet. Expected stages: {siloStages.join(', ')}</p>
          )}
        </div>
      </section>
      <section className="card">
        <header className="card__header">
          <h2>Recent Applications</h2>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {apps?.slice(0, 6).map((app) => (
              <tr key={app.id}>
                <td>{app.businessName}</td>
                <td>{app.stage}</td>
                <td>{app.status}</td>
                <td>{new Date(app.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {apps && apps.length === 0 && (
              <tr>
                <td colSpan={4}>No applications submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
