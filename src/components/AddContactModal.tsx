import { useState } from "react";
import { createContact } from "../api/contactsCreate";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddContactModal({ onClose, onCreated }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErr("First and Last name required");
      return;
    }

    setLoading(true);
    try {
      await createContact({
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        companyId: companyId || null,
      });
      onCreated();
      onClose();
    } catch (e) {
      setErr("Failed to create contact");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Add Contact</h3>

        {err && (
          <div style={{ color: "red", marginBottom: 10 }}>{err}</div>
        )}

        <input
          style={input}
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          style={input}
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          style={input}
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={input}
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          style={input}
          placeholder="Company ID (optional)"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
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
