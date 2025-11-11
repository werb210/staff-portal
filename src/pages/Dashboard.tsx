import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

type Application = {
  id: string;
  applicant?: string;
  status?: string;
  amount?: number;
  updated_at?: string;
  [key: string]: unknown;
};

type PipelineStage = {
  id: string;
  name: string;
  stage: string;
  amount?: number;
  [key: string]: unknown;
};

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
}

const MetricCard = ({ title, value, description }: MetricCardProps) => (
  <div className="card">
    <h3>{title}</h3>
    <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{value}</p>
    {description && <p style={{ margin: 0, color: 'var(--color-muted)' }}>{description}</p>}
  </div>
);

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsResponse, pipelineResponse] = await Promise.all([
          api.get<Application[]>('/api/applications'),
          api.get<PipelineStage[]>('/api/pipeline')
        ]);
        setApplications(appsResponse.data);
        setPipeline(pipelineResponse.data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch');
      }
    };

    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const totalVolume = applications.reduce((acc, application) => acc + (Number(application.amount) || 0), 0);
    const activePipeline = pipeline.filter((item) => item.stage !== 'Completed').length;
    const approvals = applications.filter((app) => (app.status || '').toLowerCase() === 'approved').length;
    const approvalRate = applications.length ? Math.round((approvals / applications.length) * 100) : 0;

    return [
      {
        title: 'Active Applications',
        value: applications.length.toString(),
        description: 'Including new submissions in the last 48 hours'
      },
      {
        title: 'Pipeline Volume',
        value: `$${totalVolume.toLocaleString()}`,
        description: 'Total financed amount across all applications'
      },
      {
        title: 'Active Pipeline Items',
        value: activePipeline.toString(),
        description: 'Items in underwriting, review, or funding'
      },
      {
        title: 'Approval Rate',
        value: `${approvalRate}%`,
        description: 'Ratio of approvals versus total decisions'
      }
    ];
  }, [applications, pipeline]);

  return (
    <div className="content-wrapper">
      <section className="page-header">
        <div>
          <h2>Mission Control</h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Live view of Boreal staff operations. Track lending performance, backlog, and communications.
          </p>
        </div>
      </section>
      {error && <div className="card">{error}</div>}
      <section className="page-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>
      <section className="card">
        <h3>Recent Activity</h3>
        {!applications.length && !pipeline.length && !error && <p>Loading activity...</p>}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {applications.slice(0, 5).map((app) => (
            <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{app.applicant || 'Unknown Applicant'}</strong>
                <p style={{ margin: 0, color: 'var(--color-muted)' }}>Status: {app.status || 'Pending'}</p>
              </div>
              <div style={{ textAlign: 'right', color: 'var(--color-muted)' }}>
                <span>${Number(app.amount || 0).toLocaleString()}</span>
                <p style={{ margin: 0 }}>{app.updated_at ? new Date(app.updated_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
