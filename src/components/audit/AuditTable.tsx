import { useEffect } from "react";
import { useAuditStore } from "../../state/auditStore";

export default function AuditTable() {
  const { records, loading, error, load, select, selected } = useAuditStore();

  useEffect(() => {
    load();
  }, [load]);

  if (loading && records.length === 0) {
    return <div>Loading audit logs…</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div style={{ overflow: "auto", maxHeight: "70vh", border: "1px solid #ddd" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f5f5f5" }}>
            <tr>
              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Time</th>
              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Event</th>
              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Actor</th>
              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Entity</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const isSelected = selected?.id === r.id;
              return (
                <tr
                  key={r.id}
                  onClick={() => select(r)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "#e0f2ff" : "transparent",
                  }}
                >
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{r.eventType}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                    {r.actorId || "—"}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                    {r.entityType || "—"} {r.entityId ? `(${r.entityId})` : ""}
                  </td>
                </tr>
              );
            })}
            {records.length === 0 && !loading && (
              <tr>
                <td colSpan={4} style={{ padding: 16, textAlign: "center" }}>
                  No audit records match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 4 }}>
        <h3>Details</h3>
        {!selected && <div>Select an audit row to see full details.</div>}
        {selected && (
          <pre
            style={{
              maxHeight: "64vh",
              overflow: "auto",
              fontSize: 12,
              background: "#f8f8f8",
              padding: 8,
            }}
          >
            {JSON.stringify(selected, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
