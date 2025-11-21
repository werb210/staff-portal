import { BarChart, Building2, FileText, Home, Landmark, Megaphone, Settings, Shield, Users, Workflow } from "lucide-react";
import { Role } from "@/store/authStore";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
  roles?: Exclude<Role, null>[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: Home, roles: ["admin", "staff"] },
  { label: "Pipeline", to: "/pipeline", icon: Workflow, roles: ["admin", "staff"] },
  { label: "Contacts", to: "/contacts", icon: Users, roles: ["admin", "staff"] },
  { label: "Companies", to: "/companies", icon: Building2, roles: ["admin", "staff"] },
  { label: "Documents", to: "/documents", icon: FileText, roles: ["admin", "staff"] },
  { label: "Marketing", to: "/marketing", icon: Megaphone, roles: ["admin", "staff"] },
  { label: "Analytics", to: "/analytics", icon: BarChart, roles: ["admin"] },
  { label: "Admin", to: "/admin", icon: Shield, roles: ["admin"] },
  { label: "Settings", to: "/settings", icon: Settings, roles: ["admin"] },
  { label: "Lender Portal", to: "/lender", icon: Landmark, roles: ["lender"] },
  { label: "Referrer Portal", to: "/referrer", icon: Landmark, roles: ["referrer"] },
];

export function filterByRole(role: Role | null | undefined) {
  return NAV_ITEMS.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));
}
