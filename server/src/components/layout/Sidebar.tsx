import { NavLink } from "react-router-dom";
import { navItems } from "@/config/navConfig";

export default function Sidebar() {
  return (
    <aside className="bf-sidebar">
      <div className="bf-sidebar-header">
        <div className="bf-logo-circle">BF</div>
        <div className="bf-logo-text">
          <div className="bf-logo-title">Boreal</div>
          <div className="bf-logo-sub">Staff Portal</div>
        </div>
      </div>

      <nav className="bf-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              "bf-nav-item" + (isActive ? " bf-nav-item-active" : "")
            }
          >
            <span className="bf-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
