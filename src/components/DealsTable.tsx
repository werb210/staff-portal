import { useEffect, useState } from "react";
import { fetchDeals, Deal } from "../api/deals";
import AddDealModal from "./AddDealModal";

export default function DealsTable() {
  const [rows, setRows] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    setLoading(true);
    fetchDeals()
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => {
        setErr("Failed to load deals");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading deals...</div>;

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
        <h2>Deals</h2>
        <button onClick={() => setShowAdd(true)}>+ Add Deal</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#e6e6e6" }}>
            <th style={th}>Title</th>
            <th style={th}>Amount</th>
            <th style={th}>Stage</th>
            <th style={th}>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} style={{ borderBottom: "1px solid #dcdcdc" }}>
              <td style={td}>{d.title}</td>
              <td style={td}>{d.amount ?? "-"}</td>
              <td style={td}>{d.stage}</td>
              <td style={td}>{new Date(d.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAdd && <AddDealModal onClose={() => setShowAdd(false)} onCreated={load} />}
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
