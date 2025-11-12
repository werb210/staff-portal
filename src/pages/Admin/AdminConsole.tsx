import { useBackups, useCreateBackup, useRetryQueue, useTriggerRetry } from '../../hooks/api/useAdmin';

export default function AdminConsole() {
  const { data: queue, isLoading: queueLoading } = useRetryQueue();
  const { data: backups, isLoading: backupsLoading } = useBackups();
  const triggerRetry = useTriggerRetry();
  const createBackup = useCreateBackup();

  return (
    <div className="page admin">
      <section className="card">
        <header className="card__header">
          <h2>Retry Queue</h2>
        </header>
        {queueLoading ? (
          <p>Loading retry queue...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Endpoint</th>
                <th>Attempts</th>
                <th>Last Error</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {queue?.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.endpoint}</td>
                  <td>{item.attempts}</td>
                  <td>{item.lastError ?? '—'}</td>
                  <td>
                    <button onClick={() => triggerRetry.mutate(item.id)} disabled={triggerRetry.isPending}>
                      Retry
                    </button>
                  </td>
                </tr>
              ))}
              {queue?.length === 0 && (
                <tr>
                  <td colSpan={5}>Retry queue is clear.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <header className="card__header">
          <h2>Backups</h2>
          <button className="btn primary" onClick={() => createBackup.mutate()} disabled={createBackup.isPending}>
            {createBackup.isPending ? 'Running...' : 'Create Backup'}
          </button>
        </header>
        {backupsLoading ? (
          <p>Loading backups...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Created</th>
                <th>Size (MB)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {backups?.map((backup) => (
                <tr key={backup.id}>
                  <td>{backup.id}</td>
                  <td>{new Date(backup.createdAt).toLocaleString()}</td>
                  <td>{backup.sizeMb}</td>
                  <td>{backup.status}</td>
                </tr>
              ))}
              {backups?.length === 0 && (
                <tr>
                  <td colSpan={4}>No backups available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
