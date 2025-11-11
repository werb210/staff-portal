import { useEffect, useState } from 'react';
import api from '../services/api';

type Document = {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await api.get<Document[]>('/api/documents');
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError('Unable to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h2>Documents</h2>
          <p style={{ color: 'var(--color-muted)' }}>Track verification packages, disclosures, and outstanding items.</p>
        </div>
      </div>
      <div className="card">
        <h3>Document Center</h3>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && documents.length === 0 && <p>No documents available.</p>}
        {!loading && !error && documents.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>{document.id}</td>
                  <td>{document.name || 'Untitled'}</td>
                  <td>{document.type || 'N/A'}</td>
                  <td><span className="status-pill">{document.status || 'Pending'}</span></td>
                  <td>{document.updated_at ? new Date(document.updated_at).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
