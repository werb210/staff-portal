import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import AppLoading from "@/components/layout/AppLoading";
import { getUsers, updateUser, type User } from "@/api/users";

type FilterState = {
  role: "all" | User["role"];
  status: "all" | User["status"];
};

const roleOptions: { value: FilterState["role"]; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "Admin", label: "Admin" },
  { value: "Staff", label: "Staff" },
  { value: "Lender", label: "Lender" },
  { value: "Referrer", label: "Referrer" }
];

const statusOptions: { value: FilterState["status"]; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" }
];

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<FilterState>({ role: "all", status: "all" });
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const params: { role?: string; status?: string } = {};
    if (filters.role !== "all") {
      params.role = filters.role;
    }
    if (filters.status !== "all") {
      params.status = filters.status;
    }
    return params;
  }, [filters.role, filters.status]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers(queryParams);
      setUsers(response.data.users);
    } catch (loadError) {
      console.error(loadError);
      setError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [queryParams]);

  const onUserChange = async (
    userId: string,
    field: "role" | "status",
    value: User["role"] | User["status"]
  ) => {
    setSavingUserId(userId);
    setError(null);
    try {
      await updateUser(userId, { [field]: value });
      await loadUsers();
    } catch (updateError) {
      console.error(updateError);
      setError("Unable to update user. Please try again.");
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) {
    return <AppLoading />;
  }

  return (
    <div className="page">
      <Card title="User Management">
        <div className="management-grid">
          <div>
            <h2>Filters</h2>
            <div className="management-grid__row">
              <Select
                label="Role"
                value={filters.role}
                options={roleOptions}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, role: event.target.value as FilterState["role"] }))
                }
              />
              <Select
                label="Status"
                value={filters.status}
                options={statusOptions}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, status: event.target.value as FilterState["status"] }))
                }
              />
            </div>
            {error && <p role="alert">{error}</p>}
          </div>
          <div>
            <h2>Users</h2>
            <Table headers={["Phone", "Name", "Role", "Status", "Last Login"]}>
              {users.map((user) => (
                <tr key={user.id} className={user.status === "disabled" ? "management-row--disabled" : undefined}>
                  <td>{user.phone}</td>
                  <td>
                    {user.first_name || "-"} {user.last_name || ""}
                  </td>
                  <td>
                    <Select
                      aria-label={`Role for ${user.phone}`}
                      value={user.role}
                      onChange={(event) =>
                        onUserChange(user.id, "role", event.target.value as User["role"])
                      }
                      disabled={savingUserId === user.id}
                    >
                      {roleOptions
                        .filter((option) => option.value !== "all")
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </Select>
                  </td>
                  <td>
                    <Select
                      aria-label={`Status for ${user.phone}`}
                      value={user.status}
                      onChange={(event) =>
                        onUserChange(user.id, "status", event.target.value as User["status"])
                      }
                      disabled={savingUserId === user.id}
                    >
                      {statusOptions
                        .filter((option) => option.value !== "all")
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </Select>
                    <span
                      className={`status-pill ${
                        user.status === "active" ? "status-pill--active" : "status-pill--paused"
                      }`}
                    >
                      {user.status === "active" ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "\u2014"}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5}>No users match the selected filters.</td>
                </tr>
              )}
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;
