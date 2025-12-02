import { useEffect, useState } from "react";
import { fetchContacts, Contact } from "../api/contacts";
import AddContactModal from "./AddContactModal";

export default function ContactsTable() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    setLoading(true);
    fetchContacts()
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => {
        setErr("Failed to load contacts");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return <div style={{ padding: 20 }}>Loading contacts...</div>;

  if (err)
    return (
      <div style={{ padding: 20, color: "red", fontWeight: "bold" }}>
        {err}
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2>Contacts</h2>
        <button onClick={() => setShowAdd(true)}>+ Add Contact</button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
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

      {showAdd && (
        <AddContactModal
          onClose={() => setShowAdd(false)}
          onCreated={load}
        />
      )}
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
