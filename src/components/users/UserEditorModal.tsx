import { useState, useEffect } from "react";
import { useUsersStore } from "../../state/usersStore";
import type { UserRecord } from "../../api/users";

const roles: UserRecord["role"][] = ["admin", "staff", "marketing", "lender", "referrer"];

export default function UserEditorModal() {
  const { editing, selected, closeEditor, save, saving } = useUsersStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRecord["role"]>("staff");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (selected) {
      setEmail(selected.email);
      setName(selected.name ?? "");
      setRole(selected.role);
      setPassword("");
    } else {
      setEmail("");
      setName("");
      setRole("staff");
      setPassword("");
    }
  }, [selected]);

  if (!editing) return null;

  return (
    <div style={modalBg}>
      <div style={modalBox}>
        <h2>{selected ? "Edit User" : "Create User"}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

          {!selected && (
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button
            disabled={saving}
            onClick={() => save({ email, name, password, role })}
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button onClick={closeEditor}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const modalBg: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalBox: React.CSSProperties = {
  padding: 24,
  background: "white",
  width: 400,
  borderRadius: 8,
  boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
};
