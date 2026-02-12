import { NavLink } from "react-router-dom";
import { useSilo } from "@/hooks/useSilo";
import { useAuth } from "@/hooks/useAuth";
import { hasRequiredRole, resolveUserRole, type UserRole } from "@/utils/roles";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavigationItem = {
  label: string;
  path: string;
  roles?: UserRole[];
};

type NavigationSection = {
  title?: string;
  items: NavigationItem[];
};

const navigationSections: NavigationSection[] = [
  {
    items: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Applications", path: "/applications" },
      { label: "CRM", path: "/crm" },
      { label: "Communications", path: "/communications" },
      { label: "Calendar", path: "/calendar" },
      { label: "Marketing", path: "/marketing" },
      { label: "Lenders", path: "/lenders" },
      { label: "Settings", path: "/settings" }
    ]
  },
  {
    title: "AI & Support",
    items: [
      { label: "AI Knowledge", path: "/admin/ai", roles: ["Admin"] },
      { label: "Support", path: "/admin/support", roles: ["Admin"] },
      { label: "Analytics", path: "/admin/analytics", roles: ["Admin"] },
      { label: "Chats", path: "/admin/ai/chats", roles: ["Admin", "Staff"] },
      { label: "Issues", path: "/admin/ai/issues", roles: ["Admin", "Staff"] },
      { label: "Operations", path: "/admin/operations", roles: ["Admin"] }
    ]
  }
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { silo } = useSilo();
  const { user } = useAuth();
  const role = resolveUserRole((user as { role?: string | null } | null)?.role ?? null);
  const canViewStaffNav = role === "Admin" || role === "Staff";
  const visibleSections = canViewStaffNav
    ? navigationSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => !item.roles || hasRequiredRole(role, item.roles))
        }))
        .filter((section) => section.items.length > 0)
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
        {visibleSections.map((section) => (
          <div key={section.title ?? "main"} className="mb-4">
            {section.title ? <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{section.title}</p> : null}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
