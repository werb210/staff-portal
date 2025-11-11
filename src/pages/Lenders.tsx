import { useEffect, useState } from 'react';
import api from '../services/api';

type Lender = {
  id: string;
  name?: string;
  products?: string[];
  contact?: string;
  status?: string;
  [key: string]: unknown;
};

export default function Lenders() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLenders = async () => {
      try {
        const { data } = await api.get<Lender[]>('/api/lenders');
        setLenders(data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchLenders();
  }, []);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h2>Lenders</h2>
          <p style={{ color: 'var(--color-muted)' }}>Manage partner institutions, program eligibility, and contact routing.</p>
        </div>
      </div>
      <div className="card">
        <h3>Partner Directory</h3>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && lenders.length === 0 && <p>No lenders configured.</p>}
        {!loading && !error && lenders.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Products</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lenders.map((lender) => (
                <tr key={lender.id}>
                  <td>{lender.id}</td>
                  <td>{lender.name || 'N/A'}</td>
                  <td>{lender.products?.join(', ') || 'N/A'}</td>
                  <td>{lender.contact || 'N/A'}</td>
                  <td><span className="status-pill">{lender.status || 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
