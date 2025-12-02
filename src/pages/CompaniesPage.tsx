// src/pages/CompaniesPage.tsx
import { useState } from "react";
import { useCompanies } from "../hooks/useCompanies";

export default function CompaniesPage() {
  const { list, create } = useCompanies();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    create.mutate({ name });
    setName("");
  };

  if (list.isLoading) return <div>Loading companies…</div>;
  if (list.isError) return <div>Error loading companies</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Companies</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <button onClick={handleCreate}>Add</button>
      </div>

      <ul>
        {list.data?.map((c: any) => (
          <li key={c.id}>{c.name ?? "Unnamed Company"}</li>
        ))}
      </ul>
    </div>
  );
}
