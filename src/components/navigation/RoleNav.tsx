import { NavLink } from "react-router-dom";
import { navItems } from "../../config/navConfig";
import { useAuthStore } from "../../state/authStore";

export default function RoleNav() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const allowed = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <nav className="bf-nav">
      {allowed.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive ? "bf-nav-item active" : "bf-nav-item"
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
