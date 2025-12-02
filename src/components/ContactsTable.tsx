import { useEffect, useState } from "react";
import { fetchContacts, Contact } from "../api/contacts";

export default function ContactsTable() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts()
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch((e) => {
        setErr("Failed to load contacts");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div style={{ padding: 20 }}>Loading contacts...</div>;

  if (err)
    return (
      <div style={{ padding: 20, color: "red", fontWeight: "bold" }}>
        {err}
      </div>
    );

  if (rows.length === 0)
    return (
      <div style={{ padding: 20 }}>
        No contacts found.
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <h2>Contacts</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
        }}
      >
        <thead>
          <tr style={{ background: "#e6e6e6" }}>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Phone</th>
            <th style={th}>Company</th>
            <th style={th}>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #dcdcdc" }}>
              <td style={td}>{c.firstName} {c.lastName}</td>
              <td style={td}>{c.email}</td>
              <td style={td}>{c.phone}</td>
              <td style={td}>{c.companyId ?? "—"}</td>
              <td style={td}>{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  padding: "10px",
  textAlign: "left" as const,
  fontWeight: "bold",
  borderBottom: "2px solid #ccc",
};

const td = {
  padding: "10px",
  textAlign: "left" as const,
};

