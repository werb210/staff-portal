import { Building2, FileText, Home, Landmark, Search, Shield, Tag, Users, Workflow } from "lucide-react";

import { Role } from "../modules/auth/auth.store";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
  roles?: Exclude<Role, null>[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Pipeline", to: "/pipeline", icon: Workflow, roles: ["admin", "staff"] },
  { label: "Contacts", to: "/contacts", icon: Users, roles: ["admin", "staff"] },
  { label: "Companies", to: "/companies", icon: Building2, roles: ["admin", "staff"] },
  { label: "Deals", to: "/deals", icon: Landmark, roles: ["admin", "staff"] },
  { label: "Applications", to: "/applications", icon: FileText, roles: ["admin", "staff"] },
  { label: "Tags", to: "/tags", icon: Tag, roles: ["admin", "staff"] },
  { label: "Search", to: "/search", icon: Search },
  { label: "Admin", to: "/admin", icon: Shield, roles: ["admin"] },
  { label: "Lender Portal", to: "/lender", icon: Landmark, roles: ["lender"] },
  { label: "Referrer Portal", to: "/referrer", icon: Landmark, roles: ["referrer"] },
];

export function filterByRole(role: Role | null | undefined) {
  return NAV_ITEMS.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));
}
