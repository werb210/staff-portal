import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { filterNavByRole, useNavStore } from "@/store/navStore";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { pathname } = useLocation();
  const open = useNavStore((s) => s.open);
  const setOpen = useNavStore((s) => s.setOpen);
  const setActive = useNavStore((s) => s.setActive);
  const user = useAuthStore((s) => s.user);

  const navItems = useMemo(() => filterNavByRole(user?.role), [user?.role]);

  return (
    <aside
      className={cn(
        "group fixed inset-y-0 left-0 z-40 hidden w-16 border-r bg-white transition-all duration-200 md:flex",
        open && "w-64"
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex w-full flex-col">
        <div className="flex h-16 items-center px-4 text-lg font-semibold">SP</div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive || active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  )
                }
                onClick={() => setActive(item.key)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-xs font-bold">
                  {item.label.charAt(0)}
                </span>
                <span className={cn("whitespace-nowrap", !open && "hidden")}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
