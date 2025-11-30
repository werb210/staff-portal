import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentStore } from '../state/documentStore';
import DocumentList from '../components/documents/DocumentList';

export default function DocumentManagerPage() {
  const { id } = useParams();
  const load = useDocumentStore((s) => s.load);

  useEffect(() => {
    if (id) load(id);
  }, [id, load]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Documents</h1>
      <DocumentList />
    </div>
  );
}
