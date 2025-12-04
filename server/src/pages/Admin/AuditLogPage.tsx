import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/audit").then((res) => setLogs(res.data || []));
  }, []);

  return (
    <div>
      <h1>Audit Log</h1>
      {logs.length === 0 && <p>No audit entries.</p>}
      <ul>
        {logs.map((l: any) => (
          <li key={l.id}>{l.action}</li>
        ))}
      </ul>
    </div>
  );
}
