import { NavLink } from "react-router-dom";
import { useSilo } from "@/hooks/useSilo";
import { useAuth } from "@/hooks/useAuth";
import { hasRequiredRole, type UserRole } from "@/utils/roles";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavigationItem = {
  label: string;
  path: string;
  roles?: UserRole[];
};

const baseNavigation: NavigationItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Applications", path: "/applications" },
  { label: "CRM", path: "/crm" },
  { label: "Communications", path: "/communications" },
  { label: "Calendar & Tasks", path: "/calendar" },
  { label: "Marketing", path: "/marketing" },
  { label: "Lenders", path: "/lenders" },
  { label: "Lender Products", path: "/lender-products" },
  { label: "Settings", path: "/settings" },
  { label: "User Management", path: "/settings/users", roles: ["Admin"] },
  { label: "My Profile", path: "/settings/profile", roles: ["Admin", "Staff"] },
  { label: "Branding", path: "/settings/branding", roles: ["Admin", "Staff"] },
  { label: "Runtime Verification", path: "/settings/runtime", roles: ["Admin", "Staff"] }
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { silo } = useSilo();
  const { user } = useAuth();
  const canViewStaffNav = user?.role === "Admin" || user?.role === "Staff";
  const navigation = canViewStaffNav
    ? baseNavigation.filter((item) => !item.roles || hasRequiredRole(user?.role ?? null, item.roles))
    : [];

  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <div className="sidebar__header">
        <span>{silo} Portal</span>
        <button type="button" className="sidebar__close" onClick={onClose} aria-label="Close navigation">
          ×
        </button>
      </div>
      <nav className="sidebar__nav">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/" || item.path === "/settings"}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
