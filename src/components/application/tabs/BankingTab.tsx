import React from 'react';
import { useApplicationStore } from '../../../state/applicationStore';

export default function BankingTab() {
  const banking = useApplicationStore((s) => s.banking);

  if (!banking) return <div>No banking analysis available.</div>;

  return (
    <div>
      <h2>Banking Analysis</h2>
      <pre>{JSON.stringify(banking, null, 2)}</pre>
    </div>
  );
}
