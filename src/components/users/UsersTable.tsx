import { useEffect } from "react";
import { useUsersStore } from "../../state/usersStore";

export default function UsersTable() {
  const { list, loading, error, load, openEditor, remove } = useUsersStore();

  useEffect(() => {
    load();
  }, [load]);

  if (loading && list.length === 0) return <div>Loading users…</div>;

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 4 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f5f5f5" }}>
          <tr>
            <th style={cell}>Email</th>
            <th style={cell}>Name</th>
            <th style={cell}>Role</th>
            <th style={cell}>Created</th>
            <th style={cell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id}>
              <td style={cell}>{u.email}</td>
              <td style={cell}>{u.name ?? "—"}</td>
              <td style={cell}>{u.role}</td>
              <td style={cell}>{new Date(u.createdAt).toLocaleString()}</td>
              <td style={cell}>
                <button onClick={() => openEditor(u)}>Edit</button>{" "}
                <button onClick={() => remove(u.id)}>Delete</button>
              </td>
            </tr>
          ))}

          {list.length === 0 && !loading && (
            <tr>
              <td style={empty} colSpan={5}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const cell: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
};

const empty: React.CSSProperties = {
  padding: 20,
  textAlign: "center",
};
