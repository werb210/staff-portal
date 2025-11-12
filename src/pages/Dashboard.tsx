import Card from '../components/Card';
import { Table } from '../components/Table';
import { useAppContext } from '../contexts/AppContext';
import { useHealthStatus } from '../hooks/useHealth';

export default function Dashboard() {
  const { applications, pipelineStages, crm } = useAppContext();
  const { data: health } = useHealthStatus();

  const inProgress = applications.filter((application) => application.status !== 'completed');
  const totalVolume = applications.reduce((total, application) => total + application.amount, 0);

  const topStage = pipelineStages.slice().sort((a, b) => b.applications.length - a.applications.length)[0];

  return (
    <div className="page page--dashboard">
      <div className="grid grid--3">
        <Card title="Active Applications">
          <strong className="metric">{inProgress.length}</strong>
          <p>Applications currently moving through the pipeline.</p>
        </Card>
        <Card title="Pipeline Volume">
          <strong className="metric">${totalVolume.toLocaleString()}</strong>
          <p>Total value of all applications.</p>
        </Card>
        <Card title="Most Active Stage">
          <strong className="metric">{topStage?.name ?? 'N/A'}</strong>
          <p>{topStage ? `${topStage.applications.length} applications` : 'No data'}</p>
        </Card>
      </div>

      <div className="grid grid--2">
        <Card title="Recent Applications">
          <Table
            data={applications.slice(0, 5)}
            columns={[
              { key: 'applicantName', header: 'Applicant' },
              { key: 'product', header: 'Product' },
              { key: 'status', header: 'Status' },
              {
                key: 'submittedAt',
                header: 'Submitted',
                render: (application) => new Date(application.submittedAt).toLocaleDateString()
              }
            ]}
            emptyState="No applications yet."
          />
        </Card>
        <Card title="Health">
          {health ? (
            <ul className="health">
              <li>
                <span>Status</span>
                <span className={`health__status health__status--${health.status}`}>{health.status}</span>
              </li>
              <li>
                <span>Version</span>
                <span>{health.version}</span>
              </li>
              {Object.entries(health.services).map(([service, status]) => (
                <li key={service}>
                  <span>{service}</span>
                  <span className={`health__status health__status--${status}`}>{status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading health status…</p>
          )}
        </Card>
      </div>

      <Card title="CRM Snapshot">
        <div className="grid grid--3">
          <div>
            <h4>Contacts</h4>
            <strong>{crm.contacts?.length ?? 0}</strong>
          </div>
          <div>
            <h4>Companies</h4>
            <strong>{crm.companies?.length ?? 0}</strong>
          </div>
          <div>
            <h4>Tasks</h4>
            <strong>{crm.tasks?.length ?? 0}</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}
