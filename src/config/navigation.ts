import { Building2, Briefcase, Home, Search as SearchIcon, Tag, Users, Workflow } from "lucide-react";

export type UserRole = string;

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Contacts", to: "/contacts", icon: Users },
  { label: "Companies", to: "/companies", icon: Building2 },
  { label: "Deals", to: "/deals", icon: Briefcase },
  { label: "Pipeline", to: "/pipeline", icon: Workflow },
  { label: "Tags", to: "/tags", icon: Tag },
  { label: "Search", to: "/search", icon: SearchIcon },
];

export function filterByRole(role: UserRole | null) {
  return NAV_ITEMS.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));
}
