import { UserRole } from "@/lib/auth/useAuthStore";
import {
  BarChart3,
  Building2,
  Briefcase,
  ChartPie,
  FileText,
  Home,
  Inbox,
  PanelLeft,
  Settings,
  Users,
  Workflow,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Pipeline", to: "/pipeline", icon: Workflow, roles: ["admin", "staff"] },
  { label: "Contacts", to: "/contacts", icon: Users, roles: ["admin", "staff"] },
  { label: "Companies", to: "/companies", icon: Building2, roles: ["admin", "staff"] },
  { label: "Documents", to: "/documents", icon: FileText, roles: ["admin", "staff"] },
  { label: "Lenders", to: "/lender", icon: Briefcase, roles: ["admin", "lender"] },
  { label: "Marketing", to: "/marketing", icon: Inbox, roles: ["admin", "marketing"] },
  { label: "Analytics", to: "/analytics", icon: BarChart3, roles: ["admin", "staff", "marketing"] },
  { label: "Settings", to: "/settings", icon: Settings, roles: ["admin", "staff"] },
  { label: "Referrer", to: "/referrer", icon: PanelLeft, roles: ["referrer", "admin"] },
  { label: "Admin", to: "/admin", icon: ChartPie, roles: ["admin"] },
];

export function filterByRole(role: UserRole | null) {
  return NAV_ITEMS.filter((item) => !item.roles || (role ? item.roles.includes(role) : false));
}
