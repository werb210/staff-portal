import { DataTable } from '../../components/Table/DataTable';
import { useDataStore } from '../../store/dataStore';
import type { ApplicationSummary } from '../../types/applications';

export default function CRM() {
  const { applications, communicationThreads } = useDataStore();

  const columns = [
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
    <div className="page crm">
      <section className="card">
        <header className="card__header">
          <h2>Relationship Overview</h2>
          <span>{applications.length} active accounts</span>
        </header>
        <DataTable<ApplicationSummary>
          caption="Customer relationships"
          columns={columns}
          data={applications}
          getRowKey={(app) => app.id}
          emptyMessage="No applications synced yet."
        />
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Communication Threads</h2>
          <span>{communicationThreads.length} interactions</span>
        </header>
        <ul className="list-inline">
          {communicationThreads.map((thread) => (
            <li key={thread.id}>
              <strong>{thread.participant}</strong> via {thread.channel} • Last touch{' '}
              {new Date(thread.lastUpdated).toLocaleString()}
            </li>
          ))}
          {communicationThreads.length === 0 && <li>No communication history logged yet.</li>}
        </ul>
      </section>
    </div>
  );
}
