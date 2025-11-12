import React from 'react';
import { useDocuments } from '../../hooks/api/useDocuments';

export default function Documents() {
  const { data: docs, isLoading } = useDocuments();
  if (isLoading) return <p>Loading documents...</p>;

  return (
    <div>
      <h1>Documents</h1>
      <ul>
        {docs?.map((doc: any) => (
          <li key={doc.id}>{doc.name} - {doc.category}</li>
        ))}
      </ul>
    </div>
  );
}
