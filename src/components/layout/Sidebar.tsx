import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Separator } from "@/components/ui/separator";

const nav = [
  { label: "Dashboard", path: "/" },
  { label: "Applications", path: "/applications" },
  { label: "Contacts", path: "/contacts" },
  { label: "Companies", path: "/companies" },
  { label: "Deals", path: "/deals" },
  { label: "Lenders", path: "/lenders" },
  { label: "Reports", path: "/reports" },
];

export default function Sidebar() {
  return (
    <div className="w-64 h-full border-r bg-white flex flex-col">
      <div className="p-4 font-bold text-xl">Boreal Staff</div>
      <Separator />
      <nav className="flex-1 p-2 flex flex-col gap-1">
        {nav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "px-3 py-2 rounded text-sm font-medium",
                isActive ? "bg-black text-white" : "hover:bg-gray-100"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
