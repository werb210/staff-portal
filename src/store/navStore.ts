import { create } from "zustand";
import { UserRole } from "@/lib/auth/useAuthStore";

type NavItemKey =
  | "dashboard"
  | "pipeline"
  | "contacts"
  | "companies"
  | "documents"
  | "lenders"
  | "reports"
  | "settings"
  | "notifications";

interface NavState {
  open: boolean;
  active?: NavItemKey;
  role?: UserRole;
  setActive: (key: NavItemKey) => void;
  setRole: (role?: UserRole) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useNavStore = create<NavState>((set) => ({
  open: false,
  active: "dashboard",
  role: undefined,
  setActive: (active) => set({ active }),
  setRole: (role) => set({ role }),
  toggle: () => set((state) => ({ open: !state.open })),
  setOpen: (open) => set({ open }),
}));

export const NAV_ITEMS: { key: NavItemKey; label: string; to: string; roles?: UserRole[] }[] = [
  { key: "dashboard", label: "Dashboard", to: "/" },
  { key: "pipeline", label: "Pipeline", to: "/pipeline" },
  { key: "contacts", label: "Contacts", to: "/contacts" },
  { key: "companies", label: "Companies", to: "/companies" },
  { key: "documents", label: "Documents", to: "/documents" },
  { key: "lenders", label: "Lenders", to: "/lenders" },
  { key: "reports", label: "Reports", to: "/reports" },
  { key: "settings", label: "Settings", to: "/settings" },
  { key: "notifications", label: "Notifications", to: "/notifications" },
];

export function filterNavByRole(role?: UserRole) {
  if (!role) return NAV_ITEMS;
  if (role === "Lender") {
    return NAV_ITEMS.filter((item) => ["lenders", "notifications", "dashboard"].includes(item.key));
  }
  return NAV_ITEMS;
}
