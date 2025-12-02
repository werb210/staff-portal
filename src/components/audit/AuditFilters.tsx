import { useState } from "react";
import { useAuditStore } from "../../state/auditStore";

export default function AuditFilters() {
  const setFilters = useAuditStore((s) => s.setFilters);
  const [form, setForm] = useState({
    eventType: "",
    userId: "",
    keyword: "",
  });

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div style={{ padding: 20, display: "flex", gap: 12 }}>
      <input
        placeholder="Event Type"
        value={form.eventType}
        onChange={(e) => update("eventType", e.target.value)}
      />
      <input
        placeholder="User ID"
        value={form.userId}
        onChange={(e) => update("userId", e.target.value)}
      />
      <input
        placeholder="Keyword"
        value={form.keyword}
        onChange={(e) => update("keyword", e.target.value)}
      />
      <button onClick={() => setFilters(form)}>Apply</button>
    </div>
  );
}
