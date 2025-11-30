import React, { useState } from 'react';
import { useDocumentStore } from '../../state/documentStore';

export default function DocumentItem({ doc, onPreview, onUpload, onVersions }: any) {
  const accept = useDocumentStore((s) => s.accept);
  const reject = useDocumentStore((s) => s.reject);
  const [rejectReason, setRejectReason] = useState('');

  const missing = !doc.existsOnBlob;

  return (
    <div
      style={{
        padding: '15px',
        background: 'white',
        borderRadius: '6px',
        marginBottom: '10px',
        borderLeft: missing ? '4px solid red' : '4px solid #ccc'
      }}
    >
      <strong>{doc.category}</strong>
      <div>{doc.name}</div>

      {missing && <div style={{ color: 'red' }}>FILE MISSING — re-upload required</div>}

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button onClick={onPreview}>Preview</button>
        <button onClick={onUpload}>Re-Upload</button>
        <button onClick={onVersions}>History</button>
        <button onClick={() => accept(doc.id)}>Accept</button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <textarea
          placeholder="Reject reason (SMS will be sent)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
        <button onClick={() => reject(doc.id, rejectReason)}>Reject</button>
      </div>
    </div>
  );
}
