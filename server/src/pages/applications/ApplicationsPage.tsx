import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export default function ApplicationsPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/applications").then(res => setList(res.data || []));
  }, []);

  return (
    <div>
      <h1>Applications</h1>
      {list.length === 0 && <p>No applications found.</p>}
      <ul>
        {list.map((a: any) => (
          <li key={a.id}>
            {a.businessName} — {a.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
