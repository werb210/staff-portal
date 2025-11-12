import React from 'react';
import { useApplications } from '../../hooks/api/useApplications';
import { usePipeline } from '../../hooks/api/usePipeline';
import { useNotifications } from '../../hooks/api/useNotifications';

export default function Dashboard() {
  const { data: apps, isLoading: appsLoading } = useApplications();
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline();
  const { data: notifications, isLoading: notifLoading } = useNotifications();

  if (appsLoading || pipelineLoading || notifLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <section>
        <h2>Pipeline Overview</h2>
        <ul>
          {pipeline?.map((stage: any) => (
            <li key={stage.id}>{stage.name}: {stage.count}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Applications Summary</h2>
        <ul>{apps?.map((app: any) => <li key={app.id}>{app.businessName}</li>)}</ul>
      </section>
      <section>
        <h2>Notifications</h2>
        <ul>{notifications?.map((n: any) => <li key={n.id}>{n.message}</li>)}</ul>
      </section>
    </div>
  );
}
