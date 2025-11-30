import React from 'react';
import FieldConflict from './FieldConflict';

export default function DocumentGroup({ title, fields }: any) {
  const keys = Object.keys(fields);

  if (keys.length === 0) {
    return (
      <div style={{ marginBottom: "40px" }}>
        <h3>{title}</h3>
        <div style={{ color: "#777" }}>No OCR fields detected.</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "40px" }}>
      <h3>{title}</h3>
      {keys.map((field) => (
        <FieldConflict key={field} field={field} data={fields[field]} />
      ))}
    </div>
  );
}
