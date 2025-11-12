import { useState } from 'react';
import { useDocuments, type DocumentRecord } from '../../hooks/api/useDocuments';
import DocumentApprovalModal from '../../components/Documents/DocumentApprovalModal';

export default function DocumentsPage() {
  const { data: docs, isLoading } = useDocuments();
  const documents: DocumentRecord[] = docs ?? [];
  const [selected, setSelected] = useState<DocumentRecord | null>(null);

  const handleAccept = (id: string) => {
    console.log('Accept document', id);
    setSelected(null);
  };

  const handleReject = (id: string) => {
    console.log('Reject document', id);
    setSelected(null);
  };

  if (isLoading) return <p>Loading documents...</p>;

  return (
    <div>
      <h1>Documents</h1>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            {doc.name} <button onClick={() => setSelected(doc)}>Review</button>
          </li>
        ))}
      </ul>
      {selected && (
        <DocumentApprovalModal document={selected} onAccept={handleAccept} onReject={handleReject} />
      )}
    </div>
  );
}
