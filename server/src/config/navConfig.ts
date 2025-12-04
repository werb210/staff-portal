export type NavItem = {
  label: string;
  path: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Contacts", path: "/contacts" },
  { label: "Companies", path: "/companies" },
  { label: "Deals", path: "/deals" },
  { label: "Applications", path: "/applications" },
  { label: "Pipeline", path: "/pipeline" },
  { label: "Documents", path: "/documents" },
  { label: "Lenders", path: "/lenders" },
  { label: "Marketing", path: "/marketing" },
  { label: "Referrals", path: "/referrals" },
  { label: "Admin Users", path: "/admin/users" },
  { label: "Audit Log", path: "/admin/audit" }
];
