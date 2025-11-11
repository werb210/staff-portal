import { useEffect, useState } from 'react';
import api from '../services/api';

type RetryItem = {
  id: string;
  category?: string;
  description?: string;
  attempts?: number;
  next_retry_at?: string;
  status?: string;
  [key: string]: unknown;
};

export default function RetryQueue() {
  const [items, setItems] = useState<RetryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await api.get<RetryItem[]>('/api/admin/retry-queue');
        setItems(data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h2>Retry Queue</h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Monitor integrations flagged for retry. Automate follow-up actions and escalate blocked workflows.
          </p>
        </div>
      </div>
      <div className="card">
        <h3>Automation Retries</h3>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && items.length === 0 && <p>No retry items detected.</p>}
        {!loading && !error && items.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Attempts</th>
                <th>Next Retry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.category || 'N/A'}</td>
                  <td style={{ maxWidth: '320px' }}>{item.description || '-'}</td>
                  <td>{item.attempts ?? 0}</td>
                  <td>{item.next_retry_at ? new Date(item.next_retry_at).toLocaleString() : 'N/A'}</td>
                  <td><span className="status-pill">{item.status || 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
