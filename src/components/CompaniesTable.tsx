import { useEffect, useState } from "react";
import { fetchCompanies, Company } from "../api/companies";
import AddCompanyModal from "./AddCompanyModal";

export default function CompaniesTable() {
  const [rows, setRows] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    setLoading(true);
    fetchCompanies()
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => {
        setErr("Failed to load companies");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return <div style={{ padding: 20 }}>Loading companies...</div>;

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
        <h2>Companies</h2>
        <button onClick={() => setShowAdd(true)}>+ Add Company</button>
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
            <th style={th}>Phone</th>
            <th style={th}>Email</th>
            <th style={th}>Website</th>
            <th style={th}>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #dcdcdc" }}>
              <td style={td}>{c.name}</td>
              <td style={td}>{c.phone}</td>
              <td style={td}>{c.email}</td>
              <td style={td}>{c.website}</td>
              <td style={td}>{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAdd && (
        <AddCompanyModal
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
