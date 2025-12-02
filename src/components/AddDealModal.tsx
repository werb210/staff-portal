import { useState } from "react";
import { createDeal } from "../api/deals";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddDealModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("New");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    if (!title.trim()) {
      setErr("Deal title is required");
      return;
    }

    setLoading(true);
    try {
      await createDeal({
        title,
        stage,
        amount: amount ? Number(amount) : null,
      });

      onCreated();
      onClose();
    } catch (e) {
      setErr("Failed to create deal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Add Deal</h3>

        {err && <div style={{ color: "red", marginBottom: 10 }}>{err}</div>}

        <input
          style={input}
          placeholder="Deal Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          style={input}
          placeholder="Amount (optional)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select style={input} value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="New">New</option>
          <option value="In Review">In Review</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
        </select>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  borderRadius: 6,
  padding: 20,
  minWidth: 300,
};

const input = {
  width: "100%",
  padding: "8px",
  marginTop: 10,
  border: "1px solid #ccc",
  borderRadius: 4,
};
