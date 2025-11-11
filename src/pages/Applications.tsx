import { useEffect, useState } from 'react';
import api from '../services/api';

type Application = {
  id: string;
  applicant?: string;
  status?: string;
  amount?: number;
  created_at?: string;
  [key: string]: unknown;
};

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get<Application[]>('/api/applications');
        setApplications(data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h2>Applications</h2>
          <p style={{ color: 'var(--color-muted)' }}>Review and track borrower applications entering the Boreal pipeline.</p>
        </div>
      </div>
      <div className="card">
        <h3>Active Applications</h3>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && applications.length === 0 && <p>No applications to show.</p>}
        {!loading && !error && applications.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.id}</td>
                  <td>{application.applicant || 'N/A'}</td>
                  <td>
                    <span className="status-pill">{application.status || 'Pending'}</span>
                  </td>
                  <td>${Number(application.amount || 0).toLocaleString()}</td>
                  <td>{application.created_at ? new Date(application.created_at).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
