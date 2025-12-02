import { useEffect } from "react";
import { useAuditStore } from "../../state/auditStore";

export default function AuditTable() {
  const { rows, page, total, pageSize, load, setPage } = useAuditStore();

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.ceil(total / pageSize) || 1;

  return (
    <div style={{ padding: 20 }}>
      <h2>Audit Logs</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th>Event</th>
            <th>User</th>
            <th>Details</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.eventType}</td>
              <td>{r.userId || "N/A"}</td>
              <td style={{ maxWidth: 400, overflow: "hidden" }}>
                {JSON.stringify(r.details)}
              </td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        {Array.from({ length: pages }).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                marginRight: 6,
                padding: "4px 10px",
                background: p === page ? "#007bff" : "#eee",
                color: p === page ? "#fff" : "#000",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
