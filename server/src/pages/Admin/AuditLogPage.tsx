import AuditFilterBar from "../../components/audit/AuditFilterBar";
import AuditTable from "../../components/audit/AuditTable";

export default function AuditLogPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Audit Logs</h1>
      <p style={{ marginBottom: 16, color: "#555" }}>
        Full system audit trail: logins, role changes, document actions, pipeline moves, and more.
      </p>
      <AuditFilterBar />
      <AuditTable />
    </div>
  );
}
