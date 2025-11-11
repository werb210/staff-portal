import { FC } from 'react';
import { useApiData } from '../hooks/useApiData';
import '../styles/layout.css';

type Document = {
  title: string;
  owner: string;
  status: string;
};

type DocumentsResponse = {
  documents: Document[];
};

const Documents: FC = () => {
  const { data, loading, error } = useApiData<DocumentsResponse>('/documents', {
    documents: [],
  });

  return (
    <section className="page-card">
      <h2>Documents</h2>
      <p>Review and collect borrower documentation.</p>
      {loading && <p>Loading documents…</p>}
      {error && <p role="alert">Failed to load documents: {error}</p>}
      {!loading && data && (
        <ul>
          {data.documents.length === 0 && <li>No documents uploaded yet.</li>}
          {data.documents.map((document) => (
            <li key={document.title}>
              <strong>{document.title}</strong> — {document.owner} ({document.status})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Documents;
