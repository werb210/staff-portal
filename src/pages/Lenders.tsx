import { useEffect, useState } from "react";
import { fetchClientLenders } from "../api/lenders";

export default function Lenders() {
  const [rows, setRows] = useState<{ id: string; name: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchClientLenders()
      .then(setRows)
      .catch(() => setErr("Failed to load lenders"));
  }, []);

  if (err) return <div role="alert">{err}</div>;

  return (
    <div>
      <h1>Lenders</h1>
      <ul>
        {rows.map(r => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
}
