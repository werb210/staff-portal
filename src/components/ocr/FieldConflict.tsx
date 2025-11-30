import React from 'react';

export default function FieldConflict({ field, data }: any) {
  const { values, conflict } = data;

  return (
    <div
      style={{
        borderLeft: conflict ? "5px solid red" : "5px solid #4caf50",
        padding: "10px",
        marginBottom: "10px",
        background: conflict ? "#ffe6e6" : "#f7f7f7",
        borderRadius: "6px",
      }}
    >
      <strong>{field}</strong>

      {values.map((v: any, idx: number) => (
        <div key={idx} style={{ fontSize: "14px", marginTop: "6px" }}>
          <span style={{ color: "#666" }}>
            Doc {v.documentId} →{" "}
          </span>
          <span style={{ color: conflict ? "red" : "black" }}>{v.value}</span>
        </div>
      ))}
    </div>
  );
}
