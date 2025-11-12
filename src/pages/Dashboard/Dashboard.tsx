import { useMemo } from 'react';
import { useApplications } from '../../hooks/api/useApplications';
import { usePipeline } from '../../hooks/api/usePipeline';
import { useRBAC } from '../../hooks/useRBAC';
import { getPipelineStagesForSilo } from '../../config/rbac';
import { StatCard } from '../../components/Card/StatCard';
import { DataTable } from '../../components/Table/DataTable';
import type { ApplicationSummary } from '../../types/applications';
import { NotificationBanner } from '../../components/Notification/NotificationBanner';
import { useDataStore } from '../../store/dataStore';

export default function Dashboard() {
  const { data: apps, isLoading: appsLoading } = useApplications();
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline();
  const { user } = useRBAC();
  const { marketingDashboards } = useDataStore();

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

  const recentColumns = [
    { key: 'businessName', header: 'Business' },
    { key: 'stage', header: 'Stage' },
    { key: 'status', header: 'Status' },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (app: ApplicationSummary) => new Date(app.updatedAt).toLocaleString(),
    },
  ];

  return (
    <div className="dashboard">
      {user?.silo === 'BI' && (
        <NotificationBanner
          tone="warning"
          message="Boreal Insurance experience is in development. Access core reporting below while we finalize underwriting workflows."
        />
      )}
      <section className="dashboard__metrics">
        <StatCard title="Total Applications" value={metrics.total} caption="Across all silos" />
        <StatCard title="Funded" value={metrics.funded} caption="Closed wins" tone="success" />
        <StatCard title="In Progress" value={metrics.pending} caption="Active pipeline" tone="warning" />
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
          <h2>Marketing Pulse</h2>
          <span>Signals captured from campaign analytics</span>
        </header>
        <div className="marketing-grid">
          {marketingDashboards.map((dash) => (
            <article key={dash.id} className={`marketing-card marketing-card--${dash.trend}`}>
              <h3>{dash.title}</h3>
              <p className="marketing-card__value">{dash.value}</p>
              <p className="marketing-card__description">{dash.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="card">
        <header className="card__header">
          <h2>Recent Applications</h2>
        </header>
        <DataTable<ApplicationSummary>
          caption="Most recent submissions across teams"
          columns={recentColumns}
          data={(apps ?? []).slice(0, 6)}
          getRowKey={(app) => app.id}
          emptyMessage="No applications submitted yet."
        />
      </section>
    </div>
  );
}
