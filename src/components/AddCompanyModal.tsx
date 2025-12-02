import { useState } from "react";
import { createCompany } from "../api/companies";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddCompanyModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    if (!name.trim()) {
      setErr("Company name is required");
      return;
    }

    setLoading(true);
    try {
      await createCompany({
        name,
        phone: phone || null,
        email: email || null,
        website: website || null,
      });

      onCreated();
      onClose();
    } catch (e) {
      setErr("Failed to create company");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Add Company</h3>

        {err && (
          <div style={{ color: "red", marginBottom: 10 }}>{err}</div>
        )}

        <input
          style={input}
          placeholder="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={input}
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          style={input}
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={input}
          placeholder="Website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

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
