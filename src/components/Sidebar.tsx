import { NavLink } from "react-router-dom";
import RoleNav from "./navigation/RoleNav";

export default function Sidebar() {
  return (
    <aside className="bf-sidebar">
      <div className="bf-sidebar-header">
        <h1 className="bf-logo">Boreal Staff</h1>
      </div>

      <nav className="bf-nav">
        <NavLink
          to="/companies"
          className={({ isActive }) =>
            isActive ? "bf-nav-item active" : "bf-nav-item"
          }
        >
          Companies
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? "bf-nav-item active" : "bf-nav-item"
          }
        >
          Products
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            isActive ? "bf-nav-item active" : "bf-nav-item"
          }
        >
          Tasks
        </NavLink>
        <NavLink
          to="/contacts"
          className={({ isActive }) =>
            isActive ? "bf-nav-item active" : "bf-nav-item"
          }
        >
          Contacts
        </NavLink>
      </nav>

      <RoleNav />

      <div className="bf-sidebar-footer">v2</div>
    </aside>
  );
}
