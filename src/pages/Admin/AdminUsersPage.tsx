import UsersTable from "../../components/users/UsersTable";
import UserEditorModal from "../../components/users/UserEditorModal";
import { useUsersStore } from "../../state/usersStore";

export default function AdminUsersPage() {
  const { openEditor } = useUsersStore();

  return (
    <div style={{ padding: 24 }}>
      <h1>Users</h1>
      <button style={{ marginBottom: 16 }} onClick={() => openEditor(null)}>
        + Create User
      </button>

      <UsersTable />
      <UserEditorModal />
    </div>
  );
}
