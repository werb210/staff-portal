import { useEffect } from "react";
import { useRoleStore } from "../../state/roleStore";

export default function RoleTable() {
  const { users, load, changeRole, toggleActive } = useRoleStore();

  useEffect(() => {
    load();
  }, []);

  return (
    <table style={{ width: "100%", marginTop: 20 }}>
      <thead>
        <tr style={{ background: "#eee" }}>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((u: any) => (
          <tr key={u.id}>
            <td>{u.email}</td>

            <td>
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="lender">Lender</option>
                <option value="referrer">Referrer</option>
              </select>
            </td>

            <td>{u.active ? "Active" : "Inactive"}</td>

            <td>
              <button
                onClick={() => toggleActive(u.id, !u.active)}
                style={{ marginRight: 8 }}
              >
                {u.active ? "Deactivate" : "Activate"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
