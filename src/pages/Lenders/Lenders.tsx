import React from 'react';
import { useLenders } from '../../hooks/api/useLenders';

export default function Lenders() {
  const { data: lenders, isLoading } = useLenders();
  if (isLoading) return <p>Loading lenders...</p>;

  return (
    <div>
      <h1>Lenders</h1>
      <ul>
        {lenders?.map((l: any) => (
          <li key={l.id}>{l.name} - {l.country}</li>
        ))}
      </ul>
    </div>
  );
}
