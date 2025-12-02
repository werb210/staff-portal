// src/pages/crm/ContactsPage.tsx
import { useContacts } from "../../hooks/useContacts";

export default function ContactsPage() {
  const { data, isLoading, error } = useContacts();

  if (isLoading) return <div>Loading contacts…</div>;
  if (error) return <div>Error loading contacts</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Contacts</h1>

      <table style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc" }}>Name</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Email</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Phone</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: 6 }}>{c.name || "N/A"}</td>
              <td style={{ padding: 6 }}>{c.email || "N/A"}</td>
              <td style={{ padding: 6 }}>{c.phone || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
