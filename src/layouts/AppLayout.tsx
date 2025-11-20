import type React from "react";
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building,
  Building2,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  ScanSearch,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { clearToken, getToken } from "../lib/auth";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";

export default function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) navigate("/login");
  }, [navigate]);

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 text-gray-900">
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* LOGO */}
        <div className="flex h-16 items-center px-6 text-xl font-semibold tracking-tight">
          Boreal Financial — Staff
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-4">
          <NavGroup title="Dashboard">
            <NavItem to="/" icon={<LayoutDashboard className="h-4 w-4" />} end>
              Overview
            </NavItem>
          </NavGroup>

          <NavGroup title="CRM">
            <NavItem to="/crm/contacts" icon={<Users className="h-4 w-4" />}>
              Contacts
            </NavItem>
            <NavItem to="/crm/companies" icon={<Building2 className="h-4 w-4" />}>
              Companies
            </NavItem>
            <NavItem to="/crm/deals" icon={<Wallet className="h-4 w-4" />}>
              Deals
            </NavItem>
            <NavItem to="/crm/tasks" icon={<FileText className="h-4 w-4" />}>
              Tasks
            </NavItem>
            <NavItem to="/crm/activity" icon={<ScanSearch className="h-4 w-4" />}>
              Activity Log
            </NavItem>
          </NavGroup>

          <NavGroup title="Pipeline">
            <NavItem to="/pipeline" icon={<KanbanSquare className="h-4 w-4" />}>
              Applications
            </NavItem>
          </NavGroup>

          <NavGroup title="Lenders">
            <NavItem to="/lenders" icon={<Building className="h-4 w-4" />}>
              Products
            </NavItem>
          </NavGroup>

          <NavGroup title="Referrers">
            <NavItem to="/referrers" icon={<Users className="h-4 w-4" />}>
              Referrer Accounts
            </NavItem>
          </NavGroup>

          <NavGroup title="Tools">
            <NavItem to="/tools/ocr" icon={<ScanSearch className="h-4 w-4" />}>
              OCR Engine
            </NavItem>
            <NavItem to="/tools/banking" icon={<Wallet className="h-4 w-4" />}>
              Banking Analysis
            </NavItem>
            <NavItem
              to="/tools/document-repair"
              icon={<FileText className="h-4 w-4" />}
            >
              Document Repair
            </NavItem>
          </NavGroup>

          <NavGroup title="Settings">
            <NavItem to="/settings" icon={<Settings className="h-4 w-4" />}>
              System Settings
            </NavItem>
            <NavItem to="/settings/users" icon={<Users className="h-4 w-4" />}>
              User Management
            </NavItem>
          </NavGroup>
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-gray-200 p-4">
          <Button
            variant="destructive"
            className="flex w-full items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden">
        {/* TOP BAR */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="text-lg font-semibold">Staff Portal</div>
        </header>

        {/* PAGE CONTENT */}
        <section className="h-[calc(100%-4rem)] overflow-y-auto p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

/* COMPONENTS */

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2 px-6 text-xs uppercase tracking-wide text-gray-500">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({
  to,
  icon,
  children,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-r-full px-6 py-2 text-sm font-medium transition",
          isActive
            ? "border-l-4 border-blue-600 bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
