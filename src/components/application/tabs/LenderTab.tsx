import React from 'react';
import { useApplicationStore } from '../../../state/applicationStore';
import { api } from '../../../api/client';

export default function LenderTab() {
  const lenders = useApplicationStore((s) => s.lenders);
  const app = useApplicationStore((s) => s.application);

  if (!app) return null;

  async function send(lenderId: string) {
    if (!app) return;

    const client = api();
    await client.post(`/lenders/send/${app.id}/${lenderId}`);
    alert("Sent to lender.");
  }

  return (
    <div>
      <h2>Lender Matching</h2>

      {lenders.map((l) => (
        <div
          key={l.lenderId}
          style={{
            marginBottom: "10px",
            padding: "10px",
            background: "#fff",
            borderRadius: "6px",
          }}
        >
          <strong>{l.lenderName}</strong>
          <br />
          Category: {l.productCategory}
          <br />
          Likelihood: {l.likelihood}%
          <br /><br />
          <button onClick={() => send(l.lenderId)}>Send to Lender</button>
        </div>
      ))}
    </div>
  );
}
