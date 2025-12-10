import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import { useSettingsStore, type AdminUser, type SiloCode } from "@/state/settings.store";

const UserManagement = () => {
  const { users, addUser, updateUser, resetUserPassword, disableUser, statusMessage } = useSettingsStore();
  const [newUser, setNewUser] = useState<Omit<AdminUser, "id">>({
    name: "",
    email: "",
    role: "STAFF",
    silos: ["BF"] as SiloCode[]
  });

  const onAddUser = (event: React.FormEvent) => {
    event.preventDefault();
    addUser(newUser);
    setNewUser({ name: "", email: "", role: "STAFF", silos: ["BF"] });
  };

  return (
    <section className="settings-panel" aria-label="User management">
      <header>
        <h2>Admin: User Management</h2>
        <p>Create and manage staff access.</p>
      </header>

      <form className="settings-grid" onSubmit={onAddUser} aria-label="Add user form">
        <Input
          label="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <Select
          label="Role"
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value as AdminUser["role"] })}
          options={[
            { value: "ADMIN", label: "Administrator" },
            { value: "STAFF", label: "Staff" }
          ]}
        />
        <Input
          label="Silos (comma separated)"
          value={newUser.silos.join(", ")}
          onChange={(e) =>
            setNewUser({ ...newUser, silos: e.target.value.split(",").map((s) => s.trim() as SiloCode) })
          }
        />
        <Button type="submit">Add user</Button>
      </form>

      <Table headers={["Name", "Email", "Role", "Silos", "Actions"]}>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.silos.join(", ")}</td>
            <td className="user-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => updateUser(user.id, { role: user.role === "ADMIN" ? "STAFF" : "ADMIN" })}
              >
                Toggle Role
              </Button>
              <Button type="button" variant="ghost" onClick={() => resetUserPassword(user.id)}>
                Reset Password
              </Button>
              <Button type="button" variant="ghost" onClick={() => disableUser(user.id)} disabled={user.disabled}>
                {user.disabled ? "Disabled" : "Disable"}
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      {statusMessage && <div role="status">{statusMessage}</div>}
    </section>
  );
};

export default UserManagement;
