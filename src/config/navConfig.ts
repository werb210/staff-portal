import type { Role } from "../state/authStore";

export type NavItem = {
  label: string;
  path: string;
  icon?: JSX.Element;
  roles: Role[];
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: ["admin", "staff", "marketing", "lender", "referrer"],
  },
  {
    label: "Contacts",
    path: "/contacts",
    roles: ["admin", "staff", "marketing"],
  },
  {
    label: "Companies",
    path: "/companies",
    roles: ["admin", "staff", "marketing"],
  },
  {
    label: "Deals / Pipeline",
    path: "/pipeline",
    roles: ["admin", "staff"],
  },
  {
    label: "Documents",
    path: "/documents",
    roles: ["admin", "staff"],
  },
  {
    label: "Marketing",
    path: "/marketing",
    roles: ["admin", "marketing"],
  },
  {
    label: "Lender Products",
    path: "/lenders",
    roles: ["admin", "lender"],
  },
  {
    label: "Referrals",
    path: "/referrals",
    roles: ["admin", "referrer"],
  },
  {
    label: "Admin — Users",
    path: "/admin/users",
    roles: ["admin"],
  },
];
