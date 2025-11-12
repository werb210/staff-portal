import { useState } from 'react';
import { useDocuments, useUpdateDocumentStatus } from '../../hooks/api/useDocuments';
import type { DocumentRecord } from '../../types/documents';
import { useOCRExtraction } from '../../hooks/ai/useAI';

export default function DocumentsPage() {
  const { data: docs, isLoading } = useDocuments();
  const updateStatus = useUpdateDocumentStatus();
  const ocrMutation = useOCRExtraction();
  const [selected, setSelected] = useState<DocumentRecord | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');

  const documents: DocumentRecord[] = Array.isArray(docs) ? docs : [];

  const handleStatusChange = (status: DocumentRecord['status']) => {
    if (!selected) return;
    updateStatus.mutate({ id: selected.id, payload: { status } });
    setSelected(null);
  };

  const handleExtract = async (document: DocumentRecord) => {
    try {
      const result = await ocrMutation.mutateAsync({
        documentId: document.id,
        fileUrl: document.applicationId ? `/files/${document.applicationId}/${document.id}` : document.id,
      });
      setSelected(document);
      setOcrResult(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('OCR extraction failed', error);
      setSelected(document);
      setOcrResult('Unable to extract data at this time.');
    }
  };

  if (isLoading) return <div className="card loading-state">Loading documents...</div>;

  return (
    <div className="page documents">
      <section className="card">
        <header className="card__header">
          <h2>Document Intake</h2>
          <span>AI-powered OCR extraction</span>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.category}</td>
                <td>{doc.status}</td>
                <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                <td className="table__actions">
                  <button onClick={() => handleExtract(doc)} disabled={ocrMutation.isPending}>
                    Extract OCR
                  </button>
                  <button onClick={() => { setSelected(doc); setOcrResult(''); }}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={5}>No documents awaiting review.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {selected && (
        <section className="card">
          <header className="card__header">
            <h2>Review: {selected.name}</h2>
          </header>
          <div className="document-review">
            <div>
              <p>Status: {selected.status}</p>
              <div className="button-group">
                <button className="btn success" onClick={() => handleStatusChange('approved')}>
                  Approve
                </button>
                <button className="btn danger" onClick={() => handleStatusChange('rejected')}>
                  Reject
                </button>
                <button className="btn" onClick={() => handleStatusChange('pending')}>
                  Re-request
                </button>
              </div>
            </div>
            <aside>
              <h3>OCR Preview</h3>
              <pre>{ocrResult || 'Run OCR extraction to preview data.'}</pre>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
