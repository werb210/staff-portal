import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import { useSettingsStore, type AdminUser } from "@/state/settings.store";
import { getErrorMessage } from "@/utils/errors";
import UserDetailsFields from "../components/UserDetailsFields";

const UserManagement = () => {
  const { users, addUser, updateUserRole, setUserDisabled, statusMessage, fetchUsers, isLoadingUsers } =
    useSettingsStore();
  const [newUser, setNewUser] = useState<Pick<AdminUser, "email" | "role" | "name"> & { phone?: string }>({
    name: "",
    email: "",
    phone: "",
    role: "Staff"
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const visibleUsers = useMemo(() => users, [users]);

  const onAddUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    try {
      await addUser({ ...newUser });
      setNewUser({ name: "", email: "", phone: "", role: "Staff" });
      setIsModalOpen(false);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to add user."));
    }
  };

  const onLoadUsers = async () => {
    setFormError(null);
    try {
      await fetchUsers();
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to load users."));
    }
  };

  const onUpdateRole = async (id: string, role: AdminUser["role"]) => {
    setFormError(null);
    try {
      await updateUserRole(id, role);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to update user role."));
    }
  };

  const onToggleDisabled = async (id: string, disabled: boolean) => {
    setFormError(null);
    try {
      await setUserDisabled(id, disabled);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to update user status."));
    }
  };

  return (
    <section className="settings-panel" aria-label="User management">
      <header>
        <h2>Admin: User Management</h2>
        <p>
          Add users, set roles, and manage access. Admins add a user, and the user logs in via OTP to finish their
          profile.
        </p>
      </header>

      {formError && <ErrorBanner message={formError} />}

      <div className="settings-actions">
        <Button type="button" variant="secondary" onClick={onLoadUsers} disabled={isLoadingUsers}>
          {isLoadingUsers ? "Refreshing..." : "Refresh users"}
        </Button>
        <Button type="button" onClick={() => setIsModalOpen(true)}>
          Add user
        </Button>
      </div>

      <div className="user-management__table">
        <Table headers={["Name", "Role", "Status", "Actions"]}>
          {visibleUsers.map((user) => {
            const safeEmail = user.email ?? "";
            const displayName = user.name ?? (safeEmail ? safeEmail.split("@")[0] : "Unknown user");
            const statusLabel = user.disabled ? "Disabled" : "Active";
            const roleValue = user.role === "Admin" || user.role === "Staff" ? user.role : "Staff";
            return (
              <tr key={user.id}>
                <td>
                  <div className="user-table__name">{displayName}</div>
                  <div className="user-table__email">{user.email}</div>
                </td>
                <td>
                  <Select
                    label="Role"
                    value={roleValue}
                    onChange={(e) => onUpdateRole(user.id, e.target.value as AdminUser["role"])}
                    options={[
                      { value: "Admin", label: "Admin" },
                      { value: "Staff", label: "Staff" }
                    ]}
                    hideLabel
                    disabled={isLoadingUsers}
                  />
                </td>
                <td>
                  <span className={`status-pill status-pill--${statusLabel.toLowerCase()}`}>{statusLabel}</span>
                </td>
                <td className="user-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onToggleDisabled(user.id, !user.disabled)}
                    disabled={isLoadingUsers}
                  >
                    {user.disabled ? "Enable" : "Disable"}
                  </Button>
                </td>
              </tr>
            );
          })}
          {visibleUsers.length === 0 && (
            <tr>
              <td colSpan={4}>No users have been added yet.</td>
            </tr>
          )}
        </Table>
      </div>

      <div className="user-management__cards">
        {visibleUsers.map((user) => {
          const safeEmail = user.email ?? "";
          const displayName = user.name ?? (safeEmail ? safeEmail.split("@")[0] : "Unknown user");
          const statusLabel = user.disabled ? "Disabled" : "Active";
          const roleValue = user.role === "Admin" || user.role === "Staff" ? user.role : "Staff";
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
                  value={roleValue}
                  onChange={(e) => onUpdateRole(user.id, e.target.value as AdminUser["role"])}
                  options={[
                    { value: "Admin", label: "Admin" },
                    { value: "Staff", label: "Staff" }
                  ]}
                  disabled={isLoadingUsers}
                />
                <div className="user-card__actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onToggleDisabled(user.id, !user.disabled)}
                    disabled={isLoadingUsers}
                  >
                    {user.disabled ? "Enable" : "Disable"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {visibleUsers.length === 0 && <div className="user-card user-card--empty">No users have been added yet.</div>}
      </div>

      {statusMessage && <div role="status">{statusMessage}</div>}

      {isModalOpen && (
        <Modal title="Add user" onClose={() => setIsModalOpen(false)}>
          <form className="settings-grid modal-form" onSubmit={onAddUser} aria-label="Add user form">
            <UserDetailsFields
              name={newUser.name}
              email={newUser.email}
              phone={newUser.phone ?? ""}
              onChange={(updates) => setNewUser((prev) => ({ ...prev, ...updates }))}
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
            <div className="settings-actions">
              <Button type="submit" disabled={isLoadingUsers}>
                {isLoadingUsers ? "Adding..." : "Add user"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default UserManagement;
