import CreateUserModal from "../../components/roles/CreateUserModal";
import RoleTable from "../../components/roles/RoleTable";

export default function RoleManagementPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>User & Role Management</h1>
      <CreateUserModal />
      <RoleTable />
    </div>
  );
}
