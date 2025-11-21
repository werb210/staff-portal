import { useState } from "react";
import { NavLink } from "react-router-dom";
import { filterByRole } from "@/config/navigation";
import { useSessionStore } from "@/store/sessionStore";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const role = useSessionStore((s) => s.role);
  const items = filterByRole(role);

  return (
    <aside
      className={cn(
        "group fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-white transition-all duration-300",
        collapsed && "w-16"
      )}
    >
      <div className="flex items-center justify-between px-3 py-4">
        <div className={cn("text-lg font-semibold", collapsed && "hidden")}>Staff Portal</div>
        <button
          className="rounded-md border p-2 text-sm hover:bg-slate-50"
          onClick={() => setCollapsed((p) => !p)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className={cn("whitespace-nowrap", collapsed && "hidden")}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <NavLink
          to="/logout"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100",
              isActive ? "bg-slate-900 text-white" : "text-slate-700"
            )
          }
        >
          <Menu className="h-4 w-4" />
          <span className={cn(collapsed && "hidden")}>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}
