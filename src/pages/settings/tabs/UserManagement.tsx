import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import { useSettingsStore, type AdminUser } from "@/state/settings.store";

const UserManagement = () => {
  const { users, addUser, updateUser, setUserDisabled, softDeleteUser, statusMessage } = useSettingsStore();
  const [newUser, setNewUser] = useState<Pick<AdminUser, "email" | "role">>({
    email: "",
    role: "Staff"
  });

  const onAddUser = (event: React.FormEvent) => {
    event.preventDefault();
    addUser({ ...newUser });
    setNewUser({ email: "", role: "Staff" });
  };

  return (
    <section className="settings-panel" aria-label="User management">
      <header>
        <h2>Admin: User Management</h2>
        <p>
          Add users, set roles, and manage access. Admin adds a user, the user logs in via OTP, and a profile is
          auto-created on first login.
        </p>
      </header>

      <form className="settings-grid" onSubmit={onAddUser} aria-label="Add user form">
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
            { value: "Admin", label: "Admin" },
            { value: "Staff", label: "Staff" }
          ]}
        />
        <Button type="submit">Add user</Button>
      </form>

      <div className="user-management__table">
        <Table headers={["User", "Email", "Role", "Status", "Actions"]}>
          {users.map((user) => {
            const displayName = user.name ?? user.email.split("@")[0];
            const statusLabel = user.deleted ? "Deleted" : user.disabled ? "Disabled" : "Active";
            return (
              <tr key={user.id}>
                <td>{displayName}</td>
                <td>{user.email}</td>
                <td>
                  <Select
                    label="Role"
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value as AdminUser["role"] })}
                    options={[
                      { value: "Admin", label: "Admin" },
                      { value: "Staff", label: "Staff" }
                    ]}
                    hideLabel
                    disabled={user.deleted}
                  />
                </td>
                <td>
                  <span className={`status-pill status-pill--${statusLabel.toLowerCase()}`}>{statusLabel}</span>
                </td>
                <td className="user-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setUserDisabled(user.id, !user.disabled)}
                    disabled={user.deleted}
                  >
                    {user.disabled ? "Enable" : "Disable"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => softDeleteUser(user.id)} disabled={user.deleted}>
                    {user.deleted ? "Deleted" : "Soft delete"}
                  </Button>
                </td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={5}>No users have been added yet.</td>
            </tr>
          )}
        </Table>
      </div>

      <div className="user-management__cards">
        {users.map((user) => {
          const displayName = user.name ?? user.email.split("@")[0];
          const statusLabel = user.deleted ? "Deleted" : user.disabled ? "Disabled" : "Active";
          return (
            <div key={user.id} className="user-card">
              <div className="user-card__header">
                <div>
                  <div className="user-card__name">{displayName}</div>
                  <div className="user-card__email">{user.email}</div>
                </div>
                <span className={`status-pill status-pill--${statusLabel.toLowerCase()}`}>{statusLabel}</span>
              </div>
              <div className="user-card__body">
                <Select
                  label="Role"
                  value={user.role}
                  onChange={(e) => updateUser(user.id, { role: e.target.value as AdminUser["role"] })}
                  options={[
                    { value: "Admin", label: "Admin" },
                    { value: "Staff", label: "Staff" }
                  ]}
                  disabled={user.deleted}
                />
                <div className="user-card__actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setUserDisabled(user.id, !user.disabled)}
                    disabled={user.deleted}
                  >
                    {user.disabled ? "Enable" : "Disable"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => softDeleteUser(user.id)}
                    disabled={user.deleted}
                  >
                    {user.deleted ? "Deleted" : "Soft delete"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {users.length === 0 && <div className="user-card user-card--empty">No users have been added yet.</div>}
      </div>

      {statusMessage && <div role="status">{statusMessage}</div>}
    </section>
  );
};

export default UserManagement;
