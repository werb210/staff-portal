import RoleNav from "./navigation/RoleNav";

export default function Sidebar() {
  return (
    <aside className="bf-sidebar">
      <div className="bf-sidebar-header">
        <h1 className="bf-logo">Boreal Staff</h1>
      </div>

      <RoleNav />

      <div className="bf-sidebar-footer">v2</div>
    </aside>
  );
}
