import { NavLink } from "react-router-dom";
import { useSilo } from "@/hooks/useSilo";
import { useAuth } from "@/hooks/useAuth";

const baseNavigation = [
  { label: "Dashboard", path: "/" },
  { label: "Applications", path: "/applications" },
  { label: "CRM", path: "/crm" },
  { label: "Communications", path: "/communications" },
  { label: "Calendar & Tasks", path: "/calendar" },
  { label: "Marketing", path: "/marketing" },
  { label: "Lenders", path: "/lenders" },
  { label: "Lender Products", path: "/lender-products" },
  { label: "My Profile", path: "/profile" },
  { label: "Settings", path: "/settings" },
  { label: "Users", path: "/admin/users" }
];

const siloNavigation = {
  BF: baseNavigation,
  BI: [
    { label: "Dashboard", path: "/" },
    { label: "CRM", path: "/crm" },
    { label: "Communications", path: "/communications" },
    { label: "Calendar & Tasks", path: "/calendar" },
    { label: "My Profile", path: "/profile" },
    { label: "Settings", path: "/settings" }
  ],
  SLF: [
    { label: "Dashboard", path: "/" },
    { label: "Applications", path: "/applications" },
    { label: "CRM", path: "/crm" },
    { label: "Communications", path: "/communications" },
    { label: "Calendar & Tasks", path: "/calendar" },
    { label: "My Profile", path: "/profile" },
    { label: "Settings", path: "/settings" }
  ]
};

const Sidebar = () => {
  const { silo } = useSilo();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const adminOnlyPaths = new Set(["/marketing", "/admin/users"]);
  const navigation = siloNavigation[silo].filter((item) =>
    adminOnlyPaths.has(item.path) ? isAdmin : true
  );

  return (
    <aside className="sidebar">
      <div className="sidebar__header">{silo} Portal</div>
      <nav className="sidebar__nav">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
