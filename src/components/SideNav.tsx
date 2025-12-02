import React from "react";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Pipeline", href: "/pipeline" },
  { label: "Applications", href: "/applications" },
  { label: "Documents", href: "/documents" },
  { label: "CRM", href: "/crm" },
  { label: "Lenders", href: "/lenders" },
  { label: "Chat", href: "/chat" },
];

export default function SideNav() {
  return (
    <nav className="flex h-full flex-col gap-2">
      {navItems.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
        >
          {item.label}
        </a>
      ))}
      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        Quick filters and navigation live here for the mock layout.
      </div>
    </nav>
  );
}
