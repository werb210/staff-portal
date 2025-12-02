import React from "react";
import { NavLink } from "react-router-dom";

const navItem = (to: string, label: string) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block rounded-md px-4 py-2 text-sm font-medium ${
        isActive
          ? "bg-indigo-600 text-white"
          : "text-slate-700 hover:bg-slate-200"
      }`
    }
  >
    {label}
  </NavLink>
);

export default function SideNav() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto">
      <div className="text-xs font-bold text-slate-500 uppercase mb-2">
        Navigation
      </div>

      <nav className="space-y-1">
        {navItem("/pipeline", "Pipeline")}
        {navItem("/contacts", "Contacts")}
        {navItem("/companies", "Companies")}
        {navItem("/lenders", "Lenders")}
        {navItem("/documents", "Documents")}
        {navItem("/chat", "Chat")}
        {navItem("/settings", "Settings")}
      </nav>
    </aside>
  );
}
