import React from 'react';
import { useApplicationStore } from '../../../state/applicationStore';
import { api } from '../../../api/client';

export default function DocumentTab() {
  const docs = useApplicationStore((s) => s.documents);
  const app = useApplicationStore((s) => s.application);

  async function download(docId: string) {
    const client = api();
    const res = await client.get(`/documents/${docId}/view`);
    window.open(res.data.sasUrl, "_blank");
  }

  if (!app) return null;

  return (
    <div>
      <h2>Documents</h2>

      {docs.map((d) => (
        <div
          key={d.id}
          style={{
            marginBottom: "10px",
            padding: "10px",
            background: "#fff",
            borderRadius: "6px",
          }}
        >
          <strong>{d.category || "Uncategorized"}</strong>
          <br />
          {d.name}
          <br />
          <button onClick={() => download(d.id)}>View / Download</button>
        </div>
      ))}
    </div>
  );
}
