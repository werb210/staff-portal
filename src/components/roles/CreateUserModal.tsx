import { useState } from "react";
import { useRoleStore } from "../../state/roleStore";

export default function CreateUserModal() {
  const addUser = useRoleStore((s: any) => s.addUser);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    role: "staff",
    password: "",
  });

  const update = (k: string, v: string) =>
    setForm({ ...form, [k]: v });

  const submit = async () => {
    await addUser(form);
    setOpen(false);
    setForm({ email: "", role: "staff", password: "" });
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>Add User</button>

      {open && (
        <div style={{ padding: 20, background: "#fff", border: "1px solid #ddd", marginTop: 20 }}>
          <h3>Create User</h3>

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <select
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="lender">Lender</option>
            <option value="referrer">Referrer</option>
          </select>

          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <button onClick={submit}>Create</button>
        </div>
      )}
    </div>
  );
}
