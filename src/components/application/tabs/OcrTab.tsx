import React from 'react';
import { useApplicationStore } from '../../../state/applicationStore';

export default function OcrTab() {
  const ocr = useApplicationStore((s) => s.ocr);

  if (!ocr || ocr.length === 0) return <div>No OCR results.</div>;

  return (
    <div>
      <h2>OCR Insights</h2>

      {ocr.map((doc: any) => (
        <div key={doc.documentId} style={{ marginBottom: "20px" }}>
          <h4>Document: {doc.documentId}</h4>
          <pre>{JSON.stringify(doc.fields, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
