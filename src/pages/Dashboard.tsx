import { FC } from 'react';
import { useApiData } from '../hooks/useApiData';
import '../styles/layout.css';

type DashboardResponse = {
  metrics: Array<{ label: string; value: string }>;
  headline: string;
};

const Dashboard: FC = () => {
  const { data, loading, error } = useApiData<DashboardResponse>('/dashboard', {
    metrics: [
      { label: 'Open Applications', value: '0' },
      { label: 'Pending Reviews', value: '0' },
      { label: 'Documents Awaiting', value: '0' },
    ],
    headline: 'Welcome back! Connect to the backend to view live metrics.',
  });

  return (
    <section className="page-card">
      <h2>Dashboard Overview</h2>
      {loading && <p>Loading metrics…</p>}
      {error && <p role="alert">Unable to load dashboard data: {error}</p>}
      {!loading && data && (
        <>
          <p>{data.headline}</p>
          <ul>
            {data.metrics.map((metric) => (
              <li key={metric.label}>
                <strong>{metric.value}</strong> — {metric.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default Dashboard;
