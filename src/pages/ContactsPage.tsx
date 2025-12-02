// src/pages/ContactsPage.tsx
import { useState } from "react";
import { useContacts } from "../hooks/useContacts";

export default function ContactsPage() {
  const { list, create } = useContacts();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    create.mutate({ name, email });
    setName("");
    setEmail("");
  };

  if (list.isLoading) return <div>Loading contacts…</div>;
  if (list.isError) return <div>Error loading contacts</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Contacts</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Contact name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <input
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <button onClick={handleCreate}>Add</button>
      </div>

      <ul>
        {list.data?.map((c: any) => (
          <li key={c.id}>
            {c.name} {c.email ? `(${c.email})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
